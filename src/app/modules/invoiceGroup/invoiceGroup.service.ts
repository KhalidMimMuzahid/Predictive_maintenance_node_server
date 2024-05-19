import mongoose from 'mongoose';
import { ReservationRequestGroup } from '../reservationGroup/reservationGroup.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { userServices } from '../user/user.service';
import { TeamOfEngineers } from '../teamOfEngineers/teamOfEngineers.model';
import { InvoiceGroup } from './invoiceGroup.model';
import { padNumberWithZeros } from '../../utils/padNumberWithZeros';
import { TInvoiceGroup } from './invoiceGroup.interface';
import { getServiceProviderBranchForUser_EngineerAndManager } from './invoiceGroup.utils';
import { TInvoice } from '../invoice/invoice.interface';
import { TReservationRequest } from '../reservation/reservation.interface';
import { Invoice } from '../invoice/invoice.model';
import { ReservationRequest } from '../reservation/reservation.model';

const assignReservationGroupToTeam = async ({
  user,
  reservationRequestGroup_id,
  teamOfEngineers_id,
}: {
  user: mongoose.Types.ObjectId;
  reservationRequestGroup_id: string;
  teamOfEngineers_id: string;
}) => {
  const resGroup = await ReservationRequestGroup.findById(
    new mongoose.Types.ObjectId(reservationRequestGroup_id),
  ).populate({
    path: 'reservationRequests',
    options: { strictPopulate: false },
  });

  if (!resGroup) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No reservation request group with this id',
    );
  }
  if (!resGroup?.postBiddingProcess?.serviceProviderCompany) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This Reservation group bidding has not been ended',
    );
  }
  if (!resGroup?.postBiddingProcess?.serviceProviderBranch) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This Reservation group has not been sent to any branch yet',
    );
  }

  const userData = await userServices.getUserBy_id(user?.toString() as string);

  const serviceProviderBranch =
    getServiceProviderBranchForUser_EngineerAndManager(userData);

  if (!serviceProviderBranch) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'something went wrong, please try again',
    );
  }

  // above up; okk; now do below

  if (
    serviceProviderBranch.toString() !==
    resGroup?.postBiddingProcess?.serviceProviderBranch?.toString()
  ) {
    //
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This reservation request group has not been send to your branch by admin',
    );
  }

  if (resGroup?.postBiddingProcess?.invoiceGroup) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This reservation group has already been assigned to another team',
    );
  }

  //  -------------------- XXXXX ----------------------

  const teamOfEngineer = await TeamOfEngineers.findById(
    new mongoose.Types.ObjectId(teamOfEngineers_id),
  );
  if (!teamOfEngineer) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No Team found with _id of team of engineers that you have provided, ',
    );
  }
  if (
    teamOfEngineer?.serviceProviderBranch?.toString() !==
    serviceProviderBranch.toString()
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "_id of team of engineers you provided, is not your branch's Team",
    );
  }
  // create all invoices  and do all
  const lastCreatedInvoiceGroup = await InvoiceGroup.findOne(
    {},
    { invoiceGroupNo: 1 },
  ).sort({ _id: -1 });

  const invoiceGroup: Partial<TInvoiceGroup> = {};

  invoiceGroup.invoiceGroupNo = padNumberWithZeros(
    Number(lastCreatedInvoiceGroup?.invoiceGroupNo || '000000') + 1,
    6,
  );
  invoiceGroup.reservationRequestGroup = resGroup?._id;

  invoiceGroup.postBiddingProcess = resGroup?.postBiddingProcess;
  invoiceGroup.taskAssignee = {
    teamOfEngineers: teamOfEngineer._id,
    taskStatus: 'ongoing',
  };

  // ----------------------- XXXXXXX --------------------- try catch and session start here

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const createdInvoiceGroupArray = await InvoiceGroup.create([invoiceGroup], {
      session: session,
    });
    if (!createdInvoiceGroupArray?.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not created invoice group, please try again',
      );
    }
    const createdInvoiceGroup = createdInvoiceGroupArray[0];

    // console.log({ createdInvoiceGroup });
    const lastCreatedInvoice = await Invoice.findOne({}, { invoiceNo: 1 }).sort(
      {
        _id: -1,
      },
    );

    const invoices = resGroup?.reservationRequests?.map((each, i) => {
      const reservationRequest = each as Partial<TReservationRequest> & {
        _id: mongoose.Types.ObjectId;
      };
      const invoice: Partial<TInvoice> = {};
      invoice.reservationRequest = reservationRequest?._id;
      invoice.reservationRequestGroup = resGroup?._id;
      invoice.invoiceGroup = createdInvoiceGroup?._id;
      invoice.user = reservationRequest?.user;
      invoice.postBiddingProcess = resGroup?.postBiddingProcess;

      invoice.invoiceNo = padNumberWithZeros(
        Number(lastCreatedInvoice?.invoiceNo || '0000000') + (i + 1),
        7,
      );

      return invoice;
    });

    const createdInvoiceArray = await Invoice.create(invoices, {
      session: session,
    });
    if (createdInvoiceArray?.length !== resGroup?.reservationRequests?.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not created invoice for all reservations, please try again',
      );
    }

    createdInvoiceGroup.invoices = createdInvoiceArray?.map(
      (each) => each?._id,
    );

    const updatedInvoiceGroup = await createdInvoiceGroup.save({
      session: session,
    });
    if (!updatedInvoiceGroup?.invoices) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not updated invoiceGroup for invoices array, please try again',
      );
    }

    resGroup.postBiddingProcess.invoiceGroup = updatedInvoiceGroup?._id;
    const updatedResGroup = await resGroup.save({ session: session });

    if (!updatedResGroup?.postBiddingProcess?.invoiceGroup) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not updated reservation Group for postBiddingProcess?.invoiceGroup, please try again',
      );
    }

    // now update those invoice _id to reservation request

    const updatedDocs = [];

    for (const item of createdInvoiceArray) {
      // Find and update document, then push the updated document to the array
      const updatedDoc = await ReservationRequest.findByIdAndUpdate(
        item.reservationRequest,
        { invoice: item._id },
        { session: session, new: true },
      );
      updatedDocs.push(updatedDoc);
    }

    if (
      updatedDocs?.length !== createdInvoiceArray?.length ||
      updatedDocs?.some((each) => !each?.invoice)
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not updated reservation request invoice _id',
      );
    }
    const updatedReservationRequests = await ReservationRequest.updateMany(
      {
        _id: { $in: resGroup.reservationRequests },
      },

      {
        status: 'ongoing',
      },
      {
        new: true,
        session: session,
      },
    );
    if (
      updatedReservationRequests?.modifiedCount !==
      resGroup.reservationRequests?.length
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not updated reservation request status',
      );
    }

    await session.commitTransaction();
    await session.endSession();

    return updatedInvoiceGroup;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};



export const invoiceGroupServices = {
  assignReservationGroupToTeam,
};

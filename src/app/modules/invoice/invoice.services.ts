import mongoose from 'mongoose';
import { TAdditionalProduct } from './invoice.interface';
import { Invoice } from './invoice.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import {
  getAllInvoicesOfReservationGroup,
  isEngineerBelongsToThisTeam,
} from './invoice.utils';
import { InvoiceGroup } from '../invoiceGroup/invoiceGroup.model';
import { ReservationRequestGroup } from '../reservationGroup/reservationGroup.model';
import { TeamOfEngineers } from '../teamOfEngineers/teamOfEngineers.model';
import { User } from '../user/user.model';

const addAdditionalProduct = async ({
  user,
  role,
  reservationRequest_id,
  additionalProduct,
}: {
  user: mongoose.Types.ObjectId;
  role: 'showaAdmin' | 'serviceProviderEngineer';
  reservationRequest_id: string;
  additionalProduct: TAdditionalProduct;
}) => {
  const existingInvoice = await Invoice.findOne({
    reservationRequest: new mongoose.Types.ObjectId(reservationRequest_id),
  }).populate({
    path: 'invoiceGroup',
    options: { strictPopulate: false },
  });
  if (!existingInvoice) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no invoice found for this reservation',
    );
  }
  let isEngineerBelongsToThisTeamData: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isUserBelongsToThisTeam: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    serviceProviderEngineer: any;
  };
  if (role === 'serviceProviderEngineer') {
    isEngineerBelongsToThisTeamData = await isEngineerBelongsToThisTeam(
      existingInvoice?.invoiceGroup,
      user,
    );
    if (
      !isEngineerBelongsToThisTeamData?.isUserBelongsToThisTeam ||
      !isEngineerBelongsToThisTeamData?.serviceProviderEngineer
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'you are not the engineer for this reservation or something went wrong',
      );
    }
  }

  const { serviceProviderEngineer } = isEngineerBelongsToThisTeamData;

  if (existingInvoice.taskStatus === 'completed') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'this reservation has already been completed; you can not add additional products',
    );
  }
  //   console.log({
  //     result,
  //   });
  //   const resGroup = await ReservationRequestGroup.findById(
  //     new mongoose.Types.ObjectId(reservationRequestGroup_id),
  //   ).populate({
  //     path: 'reservationRequests'   ,
  //     options: { strictPopulate: false }    ,
  //   });

  // calculate the total number according to its tax and price and quantity
  additionalProduct.cost.totalAmount =
    additionalProduct.cost.price * additionalProduct.cost.quantity;
  additionalProduct.addedByUserType = role;
  additionalProduct.addedBy = serviceProviderEngineer || undefined;
  // console.log({ additionalProduct });
  //   now push this additional data to additional products array
  existingInvoice.additionalProducts.products.push(additionalProduct);
  existingInvoice.additionalProducts.totalAmount +=
    additionalProduct.cost.totalAmount;
  await existingInvoice.save();
  return existingInvoice;
};

const changeStatusToCompleted = async ({
  user,
  reservationRequest_id,
}: {
  user: mongoose.Types.ObjectId;
  reservationRequest_id: string;
}) => {
  const existingInvoice = await Invoice.findOne({
    reservationRequest: new mongoose.Types.ObjectId(reservationRequest_id),
  }).populate({
    path: 'invoiceGroup',
    options: { strictPopulate: false },
  });
  if (!existingInvoice) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no invoice found for this reservation',
    );
  }

  //   const isUserBelongsToThisTeam =
  const { isUserBelongsToThisTeam, serviceProviderEngineer } =
    await isEngineerBelongsToThisTeam(existingInvoice?.invoiceGroup, user);
  if (!isUserBelongsToThisTeam || !serviceProviderEngineer) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'you are not the engineer for this reservation or something went wrong',
    );
  }

  // first check all reservations of reservation group's task status has been completed or not; if completed then also change the status of invoiceGroup.taskAssignee.taskStatus to completed

  const allInvoices: mongoose.Types.ObjectId[] =
    getAllInvoicesOfReservationGroup(existingInvoice);
  const restOfTheInvoices: mongoose.Types.ObjectId[] = allInvoices.filter(
    (invoice) => invoice.toString() !== existingInvoice?._id?.toString(),
  );
  // console.log({ allInvoices });
  // console.log({ restOfTheInvoices });

  const incompleteInvoices = await Invoice.find({
    taskStatus: { $ne: 'completed' },
    _id: { $in: restOfTheInvoices },
  });

  if (incompleteInvoices?.length === 0) {
    // that means all of the rest of the invoices have been completed
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const updatedInvoiceGroup = await InvoiceGroup.findByIdAndUpdate(
        existingInvoice.invoiceGroup,
        {
          'taskAssignee.taskStatus': 'completed',
        },
        { session: session, new: true },
      );
      if (!updatedInvoiceGroup) {
        throw new AppError(httpStatus.BAD_REQUEST, 'something went wrong');
      }

      const updatedResGroup = await ReservationRequestGroup.findOneAndUpdate(
        { 'postBiddingProcess.invoiceGroup': existingInvoice.invoiceGroup },
        {
          taskStatus: 'completed',
        },
        { session: session, new: true },
      );

      if (!updatedResGroup) {
        throw new AppError(httpStatus.BAD_REQUEST, 'something went wrong');
      }

      existingInvoice.taskStatus = 'completed';
      const updatedExistingInvoice = await existingInvoice.save({
        session: session,
      });
      if (!updatedExistingInvoice) {
        throw new AppError(httpStatus.BAD_REQUEST, 'something went wrong');
      }

      await session.commitTransaction();
      await session.endSession();
      const result = await Invoice.findOne({
        reservationRequest: new mongoose.Types.ObjectId(reservationRequest_id),
      }).populate({
        path: 'invoiceGroup',
        options: { strictPopulate: false },
      });
      return result;
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw error;
    }
  } else {
    existingInvoice.taskStatus = 'completed';
    await existingInvoice.save();
    return existingInvoice;
  }
};

const getAllInvoices = async () => {
  const invoices = await Invoice.find({}).populate([
    {
      path: 'reservationRequest',
      options: { strictPopulate: false },
    },
    {
      path: 'user',
      populate: { path: 'showaUser', options: { strictPopulate: false } },
    },
  ]);

  return invoices;
};
const getAllInvoicesByUser = async (user: string) => {
  const invoices = await Invoice.find({
    user: new mongoose.Types.ObjectId(user),
  }).populate({
    path: 'reservationRequest',
    options: { strictPopulate: false },
  });

  return invoices;
};

const getAllAssignedTasksByEngineer = async (user: mongoose.Types.ObjectId) => {
  const userData = await User.findOne({ _id: user }).select(
    'serviceProviderEngineer',
  );

  const teamOfEngineers = await TeamOfEngineers.find({
    'members.member': userData?.serviceProviderEngineer,
  });
  const teamOfEngineersList = teamOfEngineers?.map((each) => each?._id);
  const allTask = await InvoiceGroup.aggregate([
    {
      $match: {
        'taskAssignee.teamOfEngineers': { $in: teamOfEngineersList },
      },
    },

    {
      $lookup: {
        from: 'invoices',
        localField: 'invoices',
        foreignField: '_id',
        as: 'invoices',
      },
    },

    {
      $unwind: '$invoices',
    },

    {
      $replaceRoot: {
        newRoot: '$invoices',
      },
    },

    {
      $lookup: {
        from: 'reservationrequests',
        localField: 'reservationRequest',
        foreignField: '_id',
        as: 'reservationRequest',
      },
    },
  ]);
  // console.log(teamOfEngineers);

  return allTask;
};
export const invoiceServices = {
  addAdditionalProduct,
  changeStatusToCompleted,
  getAllInvoices,
  getAllInvoicesByUser,
  getAllAssignedTasksByEngineer,
};

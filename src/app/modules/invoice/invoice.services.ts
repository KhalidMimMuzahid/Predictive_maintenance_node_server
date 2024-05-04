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

const addAdditionalProduct = async ({
  user,
  reservationRequest_id,
  additionalProduct,
}: {
  user: mongoose.Types.ObjectId;
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

  //   const isUserBelongsToThisTeam =
  const { isUserBelongsToThisTeam, serviceProviderEngineer } =
    await isEngineerBelongsToThisTeam(existingInvoice?.invoiceGroup, user);
  if (!isUserBelongsToThisTeam || !serviceProviderEngineer) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'you are not the engineer for this reservation or something went wrong',
    );
  }
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
  //     path: 'reservationRequests',
  //     options: { strictPopulate: false },
  //   });

  // calculate the total number according to its tax and price and quantity
  additionalProduct.cost.totalAmount =
    additionalProduct.cost.price * additionalProduct.cost.quantity;

  additionalProduct.addedBy = serviceProviderEngineer;
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
export const invoiceServices = {
  addAdditionalProduct,
  changeStatusToCompleted,
};

import mongoose from 'mongoose';
import { TAdditionalProduct } from './invoice.interface';
import { Invoice } from './invoice.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { isEngineerBelongsToThisTeam } from './invoice.utils';

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
export const invoiceServices = {
  addAdditionalProduct,
};

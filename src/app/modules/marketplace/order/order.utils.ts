import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { TAuth } from '../../../interface/error';
import { TOrder, TPaymentType } from './order.interface';
import mongoose from 'mongoose';
import Order from './order.model';
import { padNumberWithZeros } from '../../../utils/padNumberWithZeros';
import Product from '../product/product.model';

export const orderProducts = async ({
  auth,
  quantity,
  product,
  paymentType,
  lastOrderId,
  session,
}: {
  auth: TAuth;
  quantity: number;
  product: string;
  paymentType: TPaymentType;
  lastOrderId: number;
  session: mongoose.mongo.ClientSession;
}) => {
  const productData = await Product.findById(product).select(
    'salePrice stockManagement',
  );

  if (!productData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'product you provided is not found',
    );
  }

  // we should also check the available stocks of this product here and the quantity can not be grater than available stocks
  if (quantity > productData?.stockManagement?.availableStock || quantity < 1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'quantity must be positive number and greater than available stock',
    );
  }
  const order: Partial<TOrder> = {};

  order.orderId = padNumberWithZeros(lastOrderId, 6);
  const transferFee: number = 0;
  order.user = auth?._id;
  order.product = productData?._id;
  order.status = 'pending';
  order.paymentType = paymentType;
  order.cost = {
    price: productData?.salePrice,
    quantity: quantity,
    transferFee: transferFee,
    totalAmount: productData?.salePrice * quantity + transferFee,
  };
  order.paidStatus = {
    isPaid: false,
  };

  //   try {
  // session.startTransaction();
  const createdOrderArray = await Order.create([order], { session });

  if (!createdOrderArray?.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Something went wrong creating order, please try again',
    );
  }

  const createdOrder = createdOrderArray[0];

  productData.stockManagement.availableStock -= quantity;
  const updatedProduct = await productData.save({ session });

  if (!updatedProduct) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Something went wrong creating order, please try again',
    );
  }

  // await session.commitTransaction();
  // await session.endSession();
  return createdOrder;
  //   } catch (error) {
  //     await session.abortTransaction();
  //     await session.endSession();
  //     throw error;
  //   }
};

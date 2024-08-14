import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../../errors/AppError';
import { TAuth } from '../../../interface/error';
import Cart from '../cart/cart.model';
import { TOrders, TPaymentType } from './order.interface';
import Order from './order.model';
import { orderProducts } from './order.utils';

const orderProduct = async ({
  auth,
  paymentType,
  orderArray,
}: {
  auth: TAuth;

  paymentType: TPaymentType;
  orderArray: TOrders;
}) => {
  //
  const session = await mongoose.startSession();

  try {
    const lastOrder = await Order.findOne({}, { orderId: 1 }).sort({
      _id: -1,
    });
    session.startTransaction();
    const ordersDataArray = await Promise.all(
      orderArray?.map(async (each, index) => {
        return await orderProducts({
          auth,
          product: each?.product,
          quantity: each?.quantity,
          paymentType,
          lastOrderId: Number(lastOrder?.orderId || '000000') + index + 1,
          session,
        });
      }),
    );

    if (ordersDataArray?.length !== orderArray?.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    } else {
      // order success. now create a transaction later. where it includes all orders array details
      // now remove all carts

      await Cart.deleteMany({ user: auth?._id });
      await session.commitTransaction();
      await session.endSession();
      return ordersDataArray;
    }
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};
const getMyAllOrder = async (user: mongoose.Types.ObjectId) => {
  const orders = await Order.find({ user });

  return orders;
};
const getOrderDetailsByOrder = async (order: string) => {
  const orderData = await Order.findById(order);
  return orderData;
};

export const orderServices = {
  orderProduct,
  getMyAllOrder,
  getOrderDetailsByOrder,
};

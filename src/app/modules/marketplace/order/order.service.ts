import { TAuth } from '../../../interface/error';
import { TOrders, TPaymentType } from './order.interface';
import Order from './order.model';
import mongoose from 'mongoose';
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
    session.startTransaction();
    const ordersDataArray = await Promise.all(
      orderArray?.map(async (each) => {
        await orderProducts({
          auth,
          product: each?.product,
          quantity: each?.quantity,
          paymentType,
          session,
        });
      }),
    );
    await session.commitTransaction();
    await session.endSession();
    return ordersDataArray;
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

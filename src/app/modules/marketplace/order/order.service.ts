import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../../errors/AppError';
import { TAuth } from '../../../interface/error';
import Cart from '../cart/cart.model';
import { TActionType, TOrders, TPaymentType } from './order.interface';
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

const cancelOrAcceptOrder = async ({
  // auth,
  order,
  actionType,
}: {
  // auth: TAuth;
  order: string;
  actionType: TActionType;
}) => {
  if (actionType === 'cancel') {
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(order),
        status: 'pending',
      },

      {
        status: 'canceled',
      },
    );
    if (!updatedOrder) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'this order status is pending or this order is not founded ',
      );
    }
  } else if (actionType === 'accept') {
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(order),
        status: 'pending',
      },

      {
        status: 'inprogress',
      },
    );
    if (!updatedOrder) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'this order status is pending or this order is not founded ',
      );
    }
  }
};
const getMyAllOrder = async (user: mongoose.Types.ObjectId) => {
  const orders = await Order.find({ user });

  return orders;
};
const getOrderDetailsByOrder = async (order: string) => {
  const orderData = await Order.findById(order).populate({
    path: 'product',
    select: 'name model brand details photos',
    options: { strictPopulate: false },
  });

  return orderData;
};
const getAllOrdersByShop = async ({
  shop,
  status,
}: {
  shop: string;
  status: string;
}) => {
  const allOrders = await Order.find({
    status,
    shop: new mongoose.Types.ObjectId(shop),
  });
  return allOrders;
};
const getAllOrders = async () => {
  const orders = await Order.find()
    .sort({ _id: -1 })
    .populate([
      {
        path: 'product',
        options: { strictPopulate: false },
      },
      // {
      //   path: 'user',
      //   populate: { path: 'showaUser', options: { strictPopulate: false } },
      // },
    ]);
  return orders;
};

export const orderServices = {
  orderProduct,
  cancelOrAcceptOrder,
  getMyAllOrder,
  getOrderDetailsByOrder,
  getAllOrdersByShop,
  getAllOrders,
};

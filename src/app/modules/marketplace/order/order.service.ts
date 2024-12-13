/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../../errors/AppError';
import { TAuth } from '../../../interface/error';
import Cart from '../cart/cart.model';
import {
  TActionType,
  TActionTypeForChangesStatus,
  TOrders,
  TPaymentType,
} from './order.interface';
import Order from './order.model';
import { orderProducts } from './order.utils';
import { Wallet } from '../../wallet/wallet.model';
import { updateWallet } from '../../wallet/wallet.utils';
import { TPayment } from '../../transaction/transaction.interface';
import { Transaction } from '../../transaction/transaction.model';

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
      const productPurchase: {
        user: mongoose.Types.ObjectId;
        costs: {
          product: mongoose.Types.ObjectId;
          price: number;
          quantity: number;
          // tax?: number; // percentage of tax ; by default 0%
          transferFee: number;
          totalAmount: number;
        }[];
        amount: number;
      } = ordersDataArray?.reduce(
        (productPurchase, currentOrder) => {
          productPurchase?.costs?.push({
            product: currentOrder?.product,
            price: currentOrder?.cost?.price,
            quantity: currentOrder?.cost?.quantity,
            // tax?: number; // percentage of tax ; by default 0%
            transferFee: currentOrder?.cost?.transferFee,
            totalAmount: currentOrder?.cost?.totalAmount,
          });
          productPurchase.amount += currentOrder?.cost?.totalAmount;
          return productPurchase;
        },
        { costs: [], amount: 0, user: auth?._id },
      );
      productPurchase.user = auth?._id;

      // ---------------------------------------------

      const walletData = await Wallet.findOne({ user: auth?._id }).select(
        'balance point showaMB',
      );

      if (productPurchase?.amount > walletData?.balance) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'You have not enough money to purchase, please add fund first',
        );
      }
      const updatedWallet = await updateWallet({
        session: session,
        wallet: walletData?._id,
        balance: -productPurchase?.amount,
        point: Math.ceil(productPurchase?.amount / 100),
      });
      if (!updatedWallet) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Something went wrong, please try again',
        );
      }
      const payment: TPayment = {
        type: 'productPurchase',
        productPurchase: productPurchase,
        walletStatus: {
          previous: {
            balance: walletData?.balance,
            point: walletData?.point,
            showaMB: walletData?.showaMB,
          },
          next: {
            balance: walletData?.balance - productPurchase?.amount,
            point: walletData?.point + Math.ceil(productPurchase?.amount / 100),
            showaMB: walletData?.showaMB,
          },
        },
      };

      const createdTransactionArray = await Transaction.create(
        [
          {
            type: 'payment',
            payment: payment,
            status: 'completed',
          },
        ],
        { session },
      );
      const createdTransaction = createdTransactionArray[0];
      if (!createdTransaction) {
        {
          throw new AppError(
            httpStatus.NOT_FOUND,
            'Something went wrong, please try again',
          );
        }
      }

      // ---------------------------------------------
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

        $and: [
          {
            status: {
              $ne: 'canceled', //delivered' | 'canceled
            },
          },
          {
            status: {
              $ne: 'delivered', //delivered' | 'canceled
            },
          },
        ],
      },

      {
        status: 'canceled',
        'canceled.isActivated': true,
      },
    );
    if (!updatedOrder) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'this order status are already canceled or delivered or this order is not founded ',
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
        'inprogress.isActivated': true,
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

const changeStatusWithDate = async ({
  // auth,
  order,
  actionType,
  date,
}: {
  // auth: TAuth;
  order: string;
  actionType: TActionTypeForChangesStatus;
  date: string;
}) => {
  if (actionType === 'inprogress') {
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(order),
        status: 'pending',
      },

      {
        status: 'inprogress',
        'inprogress.isActivated': true,
        'inprogress.customDate': new Date(date),
      },
    );
    if (!updatedOrder) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'this order status is not pending now or this order is not founded ',
      );
    }
  } else if (actionType === 'shipped') {
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(order),

        status: 'inprogress',
      },

      {
        status: 'shipped',
        'shipped.isActivated': true,
        'shipped.customDate': new Date(date),
      },
    );
    if (!updatedOrder) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'this order status is not inprogress now or this order is not founded ',
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

const getTotalSalesReport = async ({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) => {
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();

  // Create an array to hold the report data
  const completeReport: {
    date: string;
    totalSales: number;
    totalOrders: number;
  }[] = [];

  // Calculate the difference in months between startDate and endDate
  const diffInMonths = (endYear - startYear) * 12 + (endMonth - startMonth);

  // If the duration is under a month, prepare daily report
  if (diffInMonths === 0) {
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const formattedDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      completeReport.push({
        date: formattedDate,
        totalSales: 0,
        totalOrders: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else {
    // If the duration is more than a month, prepare monthly report
    for (let year = startYear; year <= endYear; year++) {
      const monthCount = year === endYear ? endMonth + 1 : 12;
      for (
        let month = year === startYear ? startMonth : 0;
        month < monthCount;
        month++
      ) {
        const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}`;
        completeReport.push({
          date: formattedDate,
          totalSales: 0,
          totalOrders: 0,
        });
      }
    }
  }

  const matchCriteria = {
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
    'paidStatus.isPaid': true,
  };

  const report = await Order.aggregate([
    { $match: matchCriteria },
    {
      $group: {
        _id:
          diffInMonths === 0
            ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            : { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        totalSales: { $sum: '$cost.totalAmount' },
        totalOrders: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        totalSales: { $ifNull: ['$totalSales', 0] },
        totalOrders: { $ifNull: ['$totalOrders', 0] },
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);

  // Fill in report data into the completeReport
  report.forEach((item) => {
    const foundIndex = completeReport.findIndex((r) => r.date === item.date);
    if (foundIndex !== -1) {
      completeReport[foundIndex].totalSales = item.totalSales;
      completeReport[foundIndex].totalOrders = item.totalOrders;
    }
  });

  return {
    completeReport,
  };
};

export const orderServices = {
  orderProduct,
  cancelOrAcceptOrder,
  changeStatusWithDate,
  getMyAllOrder,
  getOrderDetailsByOrder,
  getAllOrdersByShop,
  getAllOrders,
  getTotalSalesReport,
};

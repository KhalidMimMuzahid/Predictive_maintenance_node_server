import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { TAuth } from '../../../interface/error';
import catchAsync from '../../../utils/catchAsync';
import { checkUserAccessApi } from '../../../utils/checkUserAccessApi';
import sendResponse from '../../../utils/sendResponse';
import {
  actionTypeArray,
  orderStatusArray,
  paymentTypesArray,
} from './order.const';
import { TActionType, TOrders, TPaymentType } from './order.interface';
import { orderServices } from './order.service';

const orderProduct: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: 'all' });

  const orderArray = req?.body?.orders as TOrders;
  // const product = req?.query?.product as string;
  // const quantityString = req?.query?.quantity as string;
  // const quantity = parseInt(quantityString);

  const paymentType: TPaymentType = req?.query?.paymentType as TPaymentType;
  if (!paymentType) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'paymentType are required to order a product',
    );
  }

  if (!paymentTypesArray.some((each) => each === paymentType)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `payment type must be any of ${paymentTypesArray.reduce(
        (total, current) => {
          total = total + `${current}, `;
          return total;
        },
        '',
      )}`,
    );
  }

  const result = await orderServices.orderProduct({
    auth,
    paymentType,
    orderArray,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product has ordered successfully',
    data: result,
  });
});

const cancelOrAcceptOrder: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: ['serviceProviderAdmin', 'serviceProviderSubAdmin'],
  });

  const order = req?.query?.order as string;
  const actionType = req?.query?.actionType as TActionType;
  if (!order) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'order is required to cancel or approved',
    );
  }

  if (!actionTypeArray.some((each) => each === actionType)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `actionTYpe must be any of ${actionTypeArray.reduce((total, current) => {
        total = total + `${current}, `;
        return total;
      }, '')}`,
    );
  }

  const result = await orderServices.cancelOrAcceptOrder({
    // auth,
    order,
    actionType,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'order has updated successfully',
    data: result,
  });
});

const getMyAllOrder: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: 'all' });

  const result = await orderServices.getMyAllOrder(auth?._id);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'your all orders have retrieved successfully',
    data: result,
  });
});

const getOrderDetailsByOrder: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: 'all' });
  const order = req?.query?.order as string;
  if (!order) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'order_id is required to get order details',
    );
  }
  const result = await orderServices.getOrderDetailsByOrder(order);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'order details has retrieved successfully',
    data: result,
  });
});

const getAllOrdersByShop: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  checkUserAccessApi({
    auth,
    accessUsers: ['serviceProviderAdmin', 'serviceProviderSubAdmin'],
  });
  const shop = req?.query?.shop as string;
  if (!shop) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'shop is required to get all orders',
    );
  }

  const status = req?.query?.status as string;
  if (!orderStatusArray.some((each) => each === status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `status must be any of ${orderStatusArray.reduce((total, current) => {
        total = total + `${current}, `;
        return total;
      }, '')}`,
    );
  }
  const result = await orderServices.getAllOrdersByShop({ shop, status });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All orders have been retrieved successfully',
    data: result,
  });
});

const getAllOrders: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });

  const result = await orderServices.getAllOrders();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All orders have been retrieved successfully',
    data: result,
  });
});

export const orderController = {
  orderProduct,
  cancelOrAcceptOrder,
  getMyAllOrder,
  getOrderDetailsByOrder,
  getAllOrdersByShop,
  getAllOrders,
};

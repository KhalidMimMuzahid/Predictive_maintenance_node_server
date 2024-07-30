import { RequestHandler } from 'express';
import catchAsync from '../../../utils/catchAsync';
import { TAuth } from '../../../interface/error';
import { checkUserAccessApi } from '../../../utils/checkUserAccessApi';
import sendResponse from '../../../utils/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { orderServices } from './order.service';
import { paymentTypesArray } from './order.const';
import { TPaymentType } from './order.interface';

const orderProduct: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: 'all' });
  const product = req?.query?.product as string;
  const quantityString = req?.query?.quantity as string;
  const quantity = parseInt(quantityString);
  const paymentType: TPaymentType = req?.query?.paymentType as TPaymentType;
  if (!product || !quantity || !paymentType) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'product, quantity and paymentType are required to order a product   ',
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
    quantity,
    product,
    paymentType,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product has ordered successfully',
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

export const orderController = {
  orderProduct,
  getMyAllOrder,
  getOrderDetailsByOrder,
};

import httpStatus from 'http-status';
import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errors/AppError';
import sendResponse from '../../utils/sendResponse';
import { userServices } from './user.service';
import { TAuth } from '../../interface/error';

const getUserBy_id: RequestHandler = catchAsync(async (req, res) => {
  const _id = req?.query?._id;

  //   console.log({ auth: req?.headers.auth });
  if (!_id) {
    throw new AppError(httpStatus.BAD_REQUEST, '_id is required to get user');
  }
  const result = await userServices.getUserBy_id(_id as string);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

const getUserWalletInfo: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  const result = await userServices.getUserWalletInfo(auth.uid);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Wallet Info retrieved successfully',
    data: result,
  });
});

const getAllShowaCustomers: RequestHandler = catchAsync(async (req, res) => {
  const result = await userServices.getAllShowaCustomersFromDB();
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customers retrieved successfully',
    data: result,
  });
});

export const userControllers = {
  getUserBy_id,
  getAllShowaCustomers,
  getUserWalletInfo,
};

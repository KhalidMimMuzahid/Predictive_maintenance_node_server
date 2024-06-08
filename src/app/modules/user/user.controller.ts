import httpStatus from 'http-status';
import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errors/AppError';
import sendResponse from '../../utils/sendResponse';
import { userServices } from './user.service';
import { TAuth } from '../../interface/error';


const signIn: RequestHandler = catchAsync(async (req, res) => {
  const uid = req?.query?.uid;
  if (!uid) {
    throw new AppError(httpStatus.BAD_REQUEST, 'uid is required to sign in');
  }
  const result = await userServices.signIn(uid as string);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User signing in successfully',
    data: result,
  });
});
const getUserBy_id: RequestHandler = catchAsync(async (req, res) => {
  const _id: string = req?.query?._id as string;
  const rootUserFields: string = req?.query?.rootUserFields as string;
  const extendedUserFields: string = req?.query?.extendedUserFields as string;

  //   console.log({ auth: req?.headers.auth });
  if (!_id) {
    throw new AppError(httpStatus.BAD_REQUEST, '_id is required to get user');
  }
  const result = await userServices.getUserBy_id({
    _id,
    rootUserFields,
    extendedUserFields,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});
const getUsersInfoByUsersArray: RequestHandler = catchAsync(
  async (req, res) => {
    const rootUserFields: string = req?.query?.rootUserFields as string;
    const extendedUserFields: string = req?.query?.extendedUserFields as string;
    const usersArray: string[] = req?.body?.usersArray as string[];
    //   console.log({ auth: req?.headers.auth });
    if (usersArray?.length < 2) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'usersArray must  have at least 2 users',
      );
    }
    const result = await userServices.getUsersInfoByUsersArray({
      usersArray,
      rootUserFields,
      extendedUserFields,
    });
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User retrieved successfully',
      data: result,
    });
  },
);
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
  signIn,
  getUserBy_id,
  getUsersInfoByUsersArray,
  getAllShowaCustomers,
  getUserWalletInfo,
};

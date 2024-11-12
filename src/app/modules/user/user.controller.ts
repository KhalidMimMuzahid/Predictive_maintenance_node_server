import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TAuth } from '../../interface/error';
import catchAsync from '../../utils/catchAsync';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import sendResponse from '../../utils/sendResponse';
import { TAddress } from '../common/common.interface';
import { userServices } from './user.service';

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
const checkUserOnlineByUser: RequestHandler = catchAsync(async (req, res) => {
  const user: string = req?.query?.user as string;

  //   console.log({ auth: req?.headers.auth });
  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'user is required to check online user',
    );
  }
  const result = await userServices.checkUserOnlineByUser(user);
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
const followUser: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const user = req?.query?.user as string;
  // we are checking the permission of this api

  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `user is required to follow user`,
    );
  }
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });

  const results = await userServices.followUser({
    user,
    auth,
  });

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'user has  been followed successfully',
    data: results,
  });
});
const unfollowUser: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const user = req?.query?.user as string;
  // we are checking the permission of this api

  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `user is required to unfollow user`,
    );
  }
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });

  const results = await userServices.unfollowUser({
    user,
    auth,
  });

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'user has  been followed successfully',
    data: results,
  });
});

const editUserProfile: RequestHandler = catchAsync(async (req, res) => {
  const auth = req?.headers?.auth as unknown as TAuth;

  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });
  const user_id = req?.query?.user as string;
  const {
    user,
    showaUser,
    serviceProviderAdmin,
    serviceProviderBranchManager,
    serviceProviderEngineer,
  } = req.body;

  const result = await userServices.editUserProfile({
    auth,
    user_id,
    user,
    showaUser,
    serviceProviderAdmin,
    serviceProviderBranchManager,
    serviceProviderEngineer,
  });

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile updated successfully',
    data: result,
  });
});

const editUserAddress: RequestHandler = catchAsync(async (req, res) => {
  const auth = req?.headers?.auth as unknown as TAuth;

  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });

  const { addresses } = req.body;

  if (!addresses || !Array.isArray(addresses)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid address data provided');
  }

  const result = await userServices.editUserAddress({
    auth,
    addresses,
  });

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User address updated successfully',
    data: result,
  });
});

const addNewAddress: RequestHandler = catchAsync(async (req, res) => {
  const auth = req?.headers?.auth as unknown as TAuth;

  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });

  const address = req.body as TAddress;

  const result = await userServices.addNewAddress({
    auth,
    address,
  });

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'new address added successfully',
    data: result,
  });
});

export const userControllers = {
  signIn,
  getUserBy_id,
  checkUserOnlineByUser,
  getUsersInfoByUsersArray,
  getAllShowaCustomers,
  getUserWalletInfo,
  followUser,
  unfollowUser,
  editUserProfile,
  editUserAddress,
  addNewAddress,
};

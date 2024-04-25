import httpStatus from 'http-status';
import { RequestHandler } from 'express';
import catchAsync from '../../../../utils/catchAsync';
import { showaUserServices } from './showaUser.service';
import sendResponse from '../../../../utils/sendResponse';
import AppError from '../../../../errors/AppError';
import { TAuth } from '../../../../interface/error';

const createShowaUser: RequestHandler = catchAsync(async (req, res) => {
  const { rootUser, showaUser } = req.body;
  const result = await showaUserServices.createShowaUserIntoDB(
    rootUser,
    showaUser,
  );
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

const signIn: RequestHandler = catchAsync(async (req, res) => {
  const uid = req?.query?.uid;
  if (!uid) {
    throw new AppError(httpStatus.BAD_REQUEST, 'uid is required to sign in');
  }
  const result = await showaUserServices.signIn(uid as string);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User signing in successfully',
    data: result,
  });
});

const updateAddress: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const { address } = req.body;
  const result = await showaUserServices.updateAddress(auth.uid, address);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Showa user address updated successfully',
    data: result,
  });
});

const updateProfile: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const result = await showaUserServices.updateProfile(auth.uid, req.body);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Showa user profile updated successfully',
    data: result,
  });
});

const uploadProfilePhoto: RequestHandler = catchAsync(async (req, res) => {
  // const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const { fileKey, fileType } = req.body;
  const result = await showaUserServices.getSignedUrl(fileKey, fileType);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Showa user address updated successfully',
    data: result,
  });
});

export const showaUserControllers = {
  createShowaUser,
  signIn,
  updateAddress,
  uploadProfilePhoto,
  updateProfile,
};

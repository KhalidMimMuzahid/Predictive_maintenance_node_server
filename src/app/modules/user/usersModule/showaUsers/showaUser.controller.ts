import httpStatus from 'http-status';
import { RequestHandler } from 'express';
import catchAsync from '../../../../utils/catchAsync';
import { showaUserServices } from './showaUser.service';
import sendResponse from '../../../../utils/sendResponse';
import { TAuth } from '../../../../interface/error';
import AppError from '../../../../errors/AppError';
import { checkUserAccessApi } from '../../../../utils/checkUserAccessApi';

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
const getShowaUser: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
  const showaUser = req?.query?.showaUser as string;
  if (!showaUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'showaUser is required to get showaUser',
    );
  }
  const result = await showaUserServices.getShowaUserFromDB(showaUser);
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
  getShowaUser,
  updateAddress,
  uploadProfilePhoto,
  updateProfile,
};

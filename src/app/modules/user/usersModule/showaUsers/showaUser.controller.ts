import httpStatus from 'http-status';
import { RequestHandler } from 'express';
import catchAsync from '../../../../utils/catchAsync';
import { showaUserServices } from './showaUser.service';
import sendResponse from '../../../../utils/sendResponse';
import AppError from '../../../../errors/AppError';

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

export const showaUserControllers = {
  createShowaUser,
  signIn,
};

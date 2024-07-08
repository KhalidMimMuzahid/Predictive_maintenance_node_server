import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { extraDataServices } from './extraData.service';
import sendResponse from '../../utils/sendResponse';
import { cronFunctions } from '../../utils/cronFunctions/cronFunctions';

const deleteMyAccount: RequestHandler = catchAsync(async (req, res) => {
  const emailOrPhone: string = req?.query?.emailOrPhone as string;
  if (!emailOrPhone) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'emailOrPhone is required to delete your account',
    );
  }

  const results = await extraDataServices.deleteMyAccount(emailOrPhone);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Request for deleting Your account has sent successfully',
    data: results,
  });
});

// those router is only for testings
const sendIotDataAiServer: RequestHandler = catchAsync(async (req, res) => {
  const result = await cronFunctions.sendIotDataToAIServer();
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'success',
    data: result,
  });
});
export const extraDataController = {
  deleteMyAccount,
  sendIotDataAiServer,
};

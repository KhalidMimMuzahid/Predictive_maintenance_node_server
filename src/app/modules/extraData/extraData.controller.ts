import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { extraDataServices } from './extraData.service';
import sendResponse from '../../utils/sendResponse';

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

export const extraDataController = {
  deleteMyAccount,
};

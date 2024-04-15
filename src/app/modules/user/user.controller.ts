import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { userServices } from './user.service';

const createUser: RequestHandler = catchAsync(async (req, res) => {
  const userData = req.body;
  const result = await userServices.createUserIntoDB(userData);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

export const userControllers = {
  createUser,
};

import httpStatus from 'http-status';
import { RequestHandler } from 'express';
import catchAsync from '../../../../utils/catchAsync';
import { showaUserServices } from './showaUser.service';
import sendResponse from '../../../../utils/sendResponse';

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

export const showaUserControllers = {
  createShowaUser,
};

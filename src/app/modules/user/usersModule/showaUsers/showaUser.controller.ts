import httpStatus from 'http-status';
import { RequestHandler } from 'express';
import catchAsync from '../../../../utils/catchAsync';
import { showaUserServices } from './showaUser.service';
import sendResponse from '../../../../utils/sendResponse';
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

export const showaUserControllers = {
  createShowaUser,
  updateAddress,
};

import { RequestHandler } from 'express';
import { TAuth } from '../../interface/error';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { walletServices } from './wallet.service';
import { Types } from 'mongoose';

const addTransfer: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const toUser = req?.query?.to as string;
  const { amount } = req.body;
  const results = await walletServices.addTransfer(
    auth._id,
    new Types.ObjectId(toUser),
    Number(amount),
  );
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My washing machines',
    data: results,
  });
});

export const walletControllers = {
  addTransfer,
};

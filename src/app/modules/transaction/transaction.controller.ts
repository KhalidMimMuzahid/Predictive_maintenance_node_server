import { RequestHandler } from 'express';
import { TAuth } from '../../interface/error';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { transactionServices } from './transaction.service';
import AppError from '../../errors/AppError';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import { Types } from 'mongoose';

// const getRecentTransfers: RequestHandler = catchAsync(async (req, res) => {
//   const auth: TAuth = req?.headers?.auth as unknown as TAuth;
//   const results = await transactionServices.getRecentTransfers(auth._id);
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'My washing machines',
//     data: results,
//   });
// });
const createStripeCheckoutSession: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    checkUserAccessApi({ auth, accessUsers: 'all' });
    const amountString = req?.query?.amount as string;
    const amount: number = parseInt(amountString) as number;
    if (!amount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'amount is required to create stripe checkout session',
      );
    }
    const results = await transactionServices.createStripeCheckoutSession({
      user: auth?._id,
      amount,
    });
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'stripe checkout session successfully created',
      data: results,
    });
  },
);
const webhookForStripe: RequestHandler = catchAsync(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bodyData: any = req.body as any;

  const results = await transactionServices.webhookForStripe({
    sig,
    bodyData,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'stripe response has successfully recorded',
    data: results,
  });
});

const walletInterchangePointToBalance: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    checkUserAccessApi({ auth, accessUsers: 'all' });

    const pointString = req?.query?.point as string;
    const point: number = parseInt(pointString) as number;
    if (!point) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'point is required to interchange point to wallet',
      );
    }
    const results = await transactionServices.walletInterchangePointToBalance({
      user: auth?._id,
      point,
    });

    if (!point) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'point is required to interchange point to wallet',
      );
    }
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'points have converted to balance successfully',
      data: results,
    });
  },
);

const fundTransferBalanceSend: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  checkUserAccessApi({ auth, accessUsers: 'all' });
  const receiver = req?.query?.receiver as string;

  const balanceString = req?.query?.balance as string;
  const balance: number = parseInt(balanceString) as number;

  if (!balance || !receiver) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'balance and receiver are required to send balance',
    );
  }
  const result = await transactionServices.fundTransferBalanceSend({
    balance,
    sender: auth?._id,
    receiver: new Types.ObjectId(receiver),
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'points have converted to balance successfully',
    data: result,
  });
});
const fundTransferShowaMBSend: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  checkUserAccessApi({ auth, accessUsers: 'all' });
  const receiver = req?.query?.receiver as string;

  const showaMBString = req?.query?.showaMB as string;
  const showaMB: number = parseInt(showaMBString) as number;

  if (!showaMB || !receiver) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'showaMB ana receiver are required to send ShowaMB',
    );
  }
  const result = await transactionServices.fundTransferShowaMBSend({
    sender: auth?._id,
    receiver: new Types.ObjectId(receiver),
    showaMB,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'points have converted to balance successfully',
    data: result,
  });
});

export const transactionControllers = {
  // getRecentTransfers,
  createStripeCheckoutSession,
  webhookForStripe,
  walletInterchangePointToBalance,
  fundTransferBalanceSend,
  fundTransferShowaMBSend,
};

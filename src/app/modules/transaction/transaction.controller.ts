import { RequestHandler } from 'express';
import { TAuth } from '../../interface/error';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { transactionServices } from './transaction.service';
import AppError from '../../errors/AppError';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';

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

export const transactionControllers = {
  // getRecentTransfers,
  createStripeCheckoutSession,
  webhookForStripe,
};

import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { TAuth } from '../../interface/error';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { walletServices } from './wallet.service';

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

const fetchCustomerCards: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const results = await walletServices.fetchCustomerCards(auth._id);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My credit cards',
    data: results,
  });
});

const createSetupIntent: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const results = await walletServices.createSetupIntent(auth._id);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Stripe intent created',
    data: results,
  });
});

const payWithWallet: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const { amount } = req.body;
  const results = await walletServices.payWithWallet(auth._id, Number(amount));
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'payed',
    data: results,
  });
});

const payWithCard: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const { amount, paymentMethodId, allowFutureUsage } = req.body;
  const results = await walletServices.payWithCard(
    auth._id,
    Number(amount),
    paymentMethodId,
    allowFutureUsage,
  );
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'payed',
    data: results,
  });
});

const createPaymentIntent: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const { amount, paymentMethodId, allowFutureUsage } = req.body;
  const results = await walletServices.createPaymentIntent(
    auth._id,
    Number(amount),
    paymentMethodId,
    allowFutureUsage,
  );
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Fund added',
    data: results,
  });
});

const mbTransfer: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const toUser = req?.query?.to as string;
  const { amount } = req.body;
  const results = await walletServices.mbTransfer(
    auth._id,
    new Types.ObjectId(toUser),
    Number(amount),
  );
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'MB Transfered',
    data: results,
  });
});

const getMyMBTransaction: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const results = await walletServices.getMyMBTransaction(auth._id);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My MBs',
    data: results,
  });
});

const getRecentMBTransfer: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const results = await walletServices.getRecentMBTransfer(auth._id);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My MBs',
    data: results,
  });
});

// const addCardToMyWallet: RequestHandler = catchAsync(async (req, res) => {
//   const auth: TAuth = req?.headers?.auth as unknown as TAuth;
//   const card: TCard = req.body;

//   const results = await walletServices.addCardToMyWallet({
//     userId: auth._id,
//     card,
//   });

//   // Send response
//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: 'Card added to wallet successfully',
//     data: results,
//   });
// });

// const deleteCardFromMyWallet: RequestHandler = catchAsync(async (req, res) => {
//   const auth: TAuth = req?.headers?.auth as unknown as TAuth;
//   const cardId = req?.params?.cardId as string;

//   const results = await walletServices.deleteCardFromMyWallet({
//     userId: auth._id,
//     cardId,
//   });

//   // Send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Card removed from wallet successfully',
//     data: results,
//   });
// });

// const deleteCardFromMyWallet: RequestHandler = catchAsync(async (req, res) => {
//   const auth: TAuth = req?.headers?.auth as unknown as TAuth;

//   checkUserAccessApi({
//     auth,
//     accessUsers: 'all',
//   });

//   const walletId = req?.query?.wallet as string;
//   const cardId = req?.query?.card as string;

//   if (!walletId || !cardId) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       `Wallet and card are required to delete the card`,
//     );
//   }

//   const results = await walletServices.deleteCardFromMyWallet({
//     walletId,
//     cardId,
//   });

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Card has been removed successfully',
//     data: results,
//   });
// });

export const walletControllers = {
  addTransfer,
  fetchCustomerCards,
  createSetupIntent,
  payWithWallet,
  payWithCard,
  createPaymentIntent,
  mbTransfer,
  getMyMBTransaction,
  getRecentMBTransfer,
};

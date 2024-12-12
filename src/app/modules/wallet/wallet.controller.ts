import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { TAuth } from '../../interface/error';
import catchAsync from '../../utils/catchAsync';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import sendResponse from '../../utils/sendResponse';
import { TCard } from '../common/common.interface';
import { walletServices } from './wallet.service';

// {
//   const addTransfer: RequestHandler = catchAsync(async (req, res) => {
//   const auth: TAuth = req?.headers?.auth as unknown as TAuth;
//   const toUser = req?.query?.to as string;
//   const { amount } = req.body;
//   const results = await walletServices.addTransfer(
//     auth._id,
//     new Types.ObjectId(toUser),
//     Number(amount),
//   );
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'My washing machines',
//     data: results,
//   });
// });

// const fetchCustomerCards: RequestHandler = catchAsync(async (req, res) => {
//   const auth: TAuth = req?.headers?.auth as unknown as TAuth;
//   const results = await walletServices.fetchCustomerCards(auth._id);
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'My credit cards',
//     data: results,
//   });
// });

// const createSetupIntent: RequestHandler = catchAsync(async (req, res) => {
//   const auth: TAuth = req?.headers?.auth as unknown as TAuth;
//   const results = await walletServices.createSetupIntent(auth._id);
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Stripe intent created',
//     data: results,
//   });
// });

// const payWithWallet: RequestHandler = catchAsync(async (req, res) => {
//   const auth: TAuth = req?.headers?.auth as unknown as TAuth;
//   const { amount } = req.body;
//   const results = await walletServices.payWithWallet(auth._id, Number(amount));
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'payed',
//     data: results,
//   });
// });

// const payWithCard: RequestHandler = catchAsync(async (req, res) => {
//   const auth: TAuth = req?.headers?.auth as unknown as TAuth;
//   const { amount, paymentMethodId, allowFutureUsage } = req.body;
//   const results = await walletServices.payWithCard(
//     auth._id,
//     Number(amount),
//     paymentMethodId,
//     allowFutureUsage,
//   );
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'paid',
//     data: results,
//   });
// });

// const createPaymentIntent: RequestHandler = catchAsync(async (req, res) => {
//   const auth: TAuth = req?.headers?.auth as unknown as TAuth;
//   const { amount, paymentMethodId, allowFutureUsage } = req.body;
//   const results = await walletServices.createPaymentIntent(
//     auth._id,
//     Number(amount),
//     paymentMethodId,
//     allowFutureUsage,
//   );
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Fund added',
//     data: results,
//   });
// });

// const mbTransfer: RequestHandler = catchAsync(async (req, res) => {
//   const auth: TAuth = req?.headers?.auth as unknown as TAuth;
//   const toUser = req?.query?.to as string;
//   const { amount } = req.body;
//   const results = await walletServices.mbTransfer(
//     auth._id,
//     new Types.ObjectId(toUser),
//     Number(amount),
//   );
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'MB Transfered',
//     data: results,
//   });
// });

// const getMyMBTransaction: RequestHandler = catchAsync(async (req, res) => {
//   const auth: TAuth = req?.headers?.auth as unknown as TAuth;
//   const results = await walletServices.getMyMBTransaction(auth._id);
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'My MBs',
//     data: results,
//   });
// });

// const getRecentMBTransfer: RequestHandler = catchAsync(async (req, res) => {
//   const auth: TAuth = req?.headers?.auth as unknown as TAuth;
//   const results = await walletServices.getRecentMBTransfer(auth._id);
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'My MBs',
//     data: results,
//   });
// })}

const addCardToMyWallet: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req.headers.auth as unknown as TAuth;
  checkUserAccessApi({ auth, accessUsers: 'all' });

  const walletId: string = req?.query?.walletId as string;
  const card: TCard = req.body;

  const results = await walletServices.addCardToMyWallet({
    userId: auth._id,
    walletId: new Types.ObjectId(walletId),
    card,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Card added to wallet successfully',
    data: results,
  });
});

const getMyWallet: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req.headers.auth as unknown as TAuth;
  checkUserAccessApi({ auth, accessUsers: 'all' });

  const results = await walletServices.getMyWallet({
    user: auth._id,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Card added to wallet successfully',
    data: results,
  });
});

const deleteCardFromMyWallet: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req.headers.auth as unknown as TAuth;
  checkUserAccessApi({ auth, accessUsers: 'all' });

  const walletId: string = req?.query?.walletId as string;
  const cardId: string = req?.query?.cardId as string;

  const results = await walletServices.deleteCardFromMyWallet({
    userId: auth._id,
    walletId: new Types.ObjectId(walletId),
    cardId: new Types.ObjectId(cardId),
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Card deleted from wallet successfully',
    data: results,
  });
});

const editWallet: RequestHandler = catchAsync(async (req, res) => {
  const auth = req.headers.auth as unknown as TAuth;
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });

  const walletId: string = req?.query?.walletId as string;
  const { stripeCustomerId } = req.body;

  const updateData = {
    ...(stripeCustomerId && { stripeCustomerId }),
  };

  const results = await walletServices.editWallet({
    walletId: new Types.ObjectId(walletId),
    updateData,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Wallet updated successfully',
    data: results,
  });
});

export const walletControllers = {
  // {  addTransfer,
  //   fetchCustomerCards,
  //   createSetupIntent,
  //   payWithWallet,
  //   payWithCard,
  //   createPaymentIntent,
  //   mbTransfer,
  //   getMyMBTransaction,
  //   getRecentMBTransfer}
  getMyWallet,
  addCardToMyWallet, //(Maintenance Service Provider)
  deleteCardFromMyWallet, //(Maintenance Service Provider)
  editWallet,
};

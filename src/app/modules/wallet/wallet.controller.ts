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

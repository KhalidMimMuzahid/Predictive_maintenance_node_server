//import mongoose from 'mongoose';

import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TAuth } from '../../interface/error';
import catchAsync from '../../utils/catchAsync';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import sendResponse from '../../utils/sendResponse';
import { subscriptionPurchasedServices } from './subscriptionPurchased.service';

const purchaseSubscription: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  checkUserAccessApi({ auth, accessUsers: ['showaUser'] });

  const subscription = req?.query?.subscription as string;

  if (!subscription) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'subscription is required to purchase it',
    );
  }

  const result = await subscriptionPurchasedServices.createSubscription({
    user: auth?._id,
    subscription,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription has purchased successfully',
    data: result,
  });
});

const getAllMySubscriptions: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  checkUserAccessApi({ auth, accessUsers: 'all' });

  const userId = auth?._id;

  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'User ID is missing in the request',
    );
  }

  const subscriptions =
    await subscriptionPurchasedServices.getAllMySubscriptions(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscriptions retrieved successfully',
    data: subscriptions,
  });
});

const renewSubscription: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  checkUserAccessApi({ auth, accessUsers: 'all' });

  const subscriptionPurchasedId = req?.query?.subscriptionPurchasedId as string;
  const additionalValidityPeriod = parseInt(
    req?.query?.additionalValidityPeriod as string,
    10,
  );

  if (!subscriptionPurchasedId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Subscription Purchased ID is required to renew the subscription',
    );
  }

  if (isNaN(additionalValidityPeriod) || additionalValidityPeriod <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Valid additional validity period is required',
    );
  }

  const result = await subscriptionPurchasedServices.renewSubscription({
    user: auth?._id,
    subscriptionPurchasedId,
    additionalValidityPeriod,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription renewed successfully',
    data: result,
  });
});

export const subscriptionPurchasedControllers = {
  purchaseSubscription,
  getAllMySubscriptions, //(customer app)
  renewSubscription, //extend subscription  (customer app)
};

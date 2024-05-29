import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import { TAuth } from '../../interface/error';
import AppError from '../../errors/AppError';
import { subscriptionPurchasedServices } from './subscriptionPurchased.service';
import sendResponse from '../../utils/sendResponse';

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

export const subscriptionPurchasedControllers = {
  purchaseSubscription,
};

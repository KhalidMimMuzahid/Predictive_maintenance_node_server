import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TAuth } from '../../interface/error';
import catchAsync from '../../utils/catchAsync';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import sendResponse from '../../utils/sendResponse';
import { TSubscription } from './subscription.interface';
import { subscriptionServices } from './subscription.service';

const createSubscription: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
  const subscription: Partial<TSubscription> =
    req?.body as Partial<TSubscription>;

  const {
    subscriptionTitle,
    bannerUrl,
    package: packageData,
    price,
    validity,
    features,
  } = subscription;
  if (!packageData || !price || !features) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'package, price, features are required for adding subscription  ',
    );
  }
  const { packageFor, showaUser } = packageData;
  const { packageType } = showaUser;

  const subscriptionData: Partial<TSubscription> = {
    subscriptionTitle,
    bannerUrl,
    package: {
      packageFor,
      showaUser: {
        packageType,
        [packageType]: showaUser[packageType],
      },
    },
    price,
    validity,
    features,
  };

  const result =
    await subscriptionServices.createSubscription(subscriptionData);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription has created successfully',
    data: result,
  });
});

const getAllOfferedSubscriptionsForShowaUser: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    checkUserAccessApi({ auth, accessUsers: 'all' });

    const subscriptions =
      await subscriptionServices.getAllOfferedSubscriptionsForShowaUser();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'All offered subscriptions retrieved successfully',
      data: subscriptions,
    });
  },
);

export const subscriptionControllers = {
  createSubscription,
  getAllOfferedSubscriptionsForShowaUser, //(customer app)
};

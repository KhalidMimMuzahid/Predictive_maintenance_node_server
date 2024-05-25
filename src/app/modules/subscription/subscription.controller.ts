import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { TAuth } from '../../interface/error';
import { TSubscription } from './subscription.interface';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import { subscriptionServices } from './subscription.service';
import AppError from '../../errors/AppError';

const createSubscription: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
  const subscription: Partial<TSubscription> =
    req?.body as Partial<TSubscription>;

  const {
    subscriptionTitle,
    package: packageData,
    price,
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
    package: {
      packageFor,
      showaUser: {
        packageType,
        [packageType]: showaUser[packageType],
      },
    },
    price,
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

export const subscriptionControllers = {
  createSubscription,
};

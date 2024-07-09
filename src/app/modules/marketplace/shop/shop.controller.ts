import { RequestHandler } from 'express';
import catchAsync from '../../../utils/catchAsync';
import { TAuth } from '../../../interface/error';
import { checkUserAccessApi } from '../../../utils/checkUserAccessApi';
import { TShop } from './shop.interface';
import AppError from '../../../errors/AppError';
import httpStatus from 'http-status';
import sendResponse from '../../../utils/sendResponse';
import { shopServices } from './shop.service';

const createShop: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: ['serviceProviderAdmin'] });
  const shop: Partial<TShop> = req?.body as Partial<TShop>;

  if (!shop) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'shop data is required to create shop',
    );
  }

  const result = await shopServices.createShop({ auth, shop });

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'shop has been created successfully',
    data: result,
  });
});

export const shopController = {
  createShop,
};

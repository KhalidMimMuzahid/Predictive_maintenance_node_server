import httpStatus from 'http-status';
import sendResponse from '../../../utils/sendResponse';
import { RequestHandler } from 'express';
import catchAsync from '../../../utils/catchAsync';
import { checkUserAccessApi } from '../../../utils/checkUserAccessApi';
import { TAuth } from '../../../interface/error';
import { cartServices } from './cart.service';
import AppError from '../../../errors/AppError';

const addProductToCart: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: 'all' });
  const product = req?.query?.product as string;
  const quantityString = req?.query?.quantity as string;
  const quantity = parseInt(quantityString);

  if (!product || !quantity) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'product and quantity are required to add product to cart',
    );
  }
  const result = await cartServices.addProductToCart({
    auth,
    quantity,
    product,
  });

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product has added t your cart',
    data: result,
  });
});

export const cartController = {
  addProductToCart,
};

import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { TAuth } from '../../../interface/error';
import catchAsync from '../../../utils/catchAsync';
import { checkUserAccessApi } from '../../../utils/checkUserAccessApi';
import sendResponse from '../../../utils/sendResponse';
import { cartServices } from './cart.service';

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

const deleteCart: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: 'all' });
  const cart = req?.query?.cart as string;

  if (!cart) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'cart is required to delete cart',
    );
  }
  await cartServices.deleteCart(cart);

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'cart has deleted successfully',
    data: null,
  });
});

const getMyAllCarts: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: 'all' });

  const result = await cartServices.getMyAllCarts(auth?._id);

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'your cart has retrieved successfully',
    data: result,
  });
});

export const cartController = {
  addProductToCart, //customer app-> marketplace-> product details ->add to cart
  deleteCart, //customer app-> marketplace
  getMyAllCarts, //customer app-> marketplace->cart->my cart
};

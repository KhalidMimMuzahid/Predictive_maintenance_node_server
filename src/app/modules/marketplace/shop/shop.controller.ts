import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { TAuth } from '../../../interface/error';
import catchAsync from '../../../utils/catchAsync';
import { checkUserAccessApi } from '../../../utils/checkUserAccessApi';
import sendResponse from '../../../utils/sendResponse';
import { TShop } from './shop.interface';
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

const getShopDashboard: RequestHandler = async (req, res) => {
  const auth = req.headers.auth as unknown as TAuth;

  // Check user access
  checkUserAccessApi({
    auth,
    accessUsers: ['serviceProviderAdmin'],
  });

  const shopId = req.query.shopId as string;

  if (!shopId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Shop ID is required to get the dashboard summary',
    });
  }

  // Call service method
  const result = await shopServices.getShopDashboard({
    shopId,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'get shop dashboard summary',
    data: result,
  });
};

const getProductSalesForGraph: RequestHandler = async (req, res) => {
  const auth = req.headers.auth as unknown as TAuth;

  // Check user access
  checkUserAccessApi({
    auth,
    accessUsers: ['serviceProviderAdmin'],
  });

  const shopId = req?.query?.shopId as string;

  if (!shopId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Shop ID is required to get the dashboard summary',
    });
  }

  const result = await shopServices.getProductSalesForGraph({
    shopId,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'get product sales for graph',
    data: result,
  });
};

export const shopController = {
  createShop, //Service Provider app->maintenance-company-
  getShopDashboard, //Service Provider app->maintenance-company->shop dashboard
  getProductSalesForGraph, //Service Provider app->maintenance-company->shop dashboard
};

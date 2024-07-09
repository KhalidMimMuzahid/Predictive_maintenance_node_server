import { RequestHandler } from 'express';
import catchAsync from '../../../utils/catchAsync';
import { TAuth } from '../../../interface/error';
import { checkUserAccessApi } from '../../../utils/checkUserAccessApi';
import sendResponse from '../../../utils/sendResponse';
import httpStatus from 'http-status';
import { TProduct, TProductFilter } from './product.interface';
import { productServices } from './product.service';
import AppError from '../../../errors/AppError';

const createProduct: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: ['showaAdmin', 'serviceProviderAdmin'],
  });
  const product: Partial<TProduct> = req?.body as Partial<TProduct>;

  const result = await productServices.createProduct({
    auth,
    product,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product has added successfully',
    data: result,
  });
});
const getAllProducts: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });

  const filterQuery = req?.query as Partial<TProductFilter>;

  // const {
  //   productName,
  //   brandName,
  //   modelName,
  //   categories,
  //   subCategories,
  //   minPrice,
  //   maxPrice,
  // } = filterQuery;

  const result = await productServices.getAllProducts(filterQuery);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'products has retrieved successfully',
    data: result,
  });
});

const getProductByProduct_id: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  const productId = req?.query?.productId as string;
  if (!productId) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product id is required');
  }
  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });

  const result = await productServices.getProductByProduct_id(productId);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'products has retrieved successfully',
    data: result,
  });
});

export const productController = {
  createProduct,
  getAllProducts,
  getProductByProduct_id,
};

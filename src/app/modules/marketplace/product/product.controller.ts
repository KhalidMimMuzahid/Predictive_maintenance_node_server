import { RequestHandler } from 'express';
import catchAsync from '../../../utils/catchAsync';
import { TAuth } from '../../../interface/error';
import { checkUserAccessApi } from '../../../utils/checkUserAccessApi';
import sendResponse from '../../../utils/sendResponse';
import httpStatus from 'http-status';
import {
  TProduct,
  TProductFilter,
  TReviewObject,
  TSortType,
  TSortedBy,
} from './product.interface';
import { productServices } from './product.service';
import AppError from '../../../errors/AppError';
import { sortTypeArray, sortedByArray } from './product.const';

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

const editProduct: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: ['showaAdmin', 'serviceProviderAdmin'],
  });
  const productData: Partial<TProduct> = req?.body as Partial<TProduct>;
  const product = req.query.product as string;

  if (!product) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'product is required to edit product',
    );
  }
  const result = await productServices.editProduct({
    auth,
    product,
    productData,
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
const addReview: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });
  const product = req?.query?.product as string;

  if (!product) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'product is required to add a review',
    );
  }
  const reviewObject = req?.body as TReviewObject;
  const result = await productServices.addReview({
    reviewObject,
    user: auth?._id,
    product,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'review has added to product successfully',
    data: result,
  });
});

const getAllProductsCategoryWise: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({
      auth,
      accessUsers: 'all',
    });

    const result = await productServices.getAllProductsCategoryWise();
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'category wise products has retrieved successfully',
      data: result,
    });
  },
);

const getAllProductsByShopDashboard: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({
      auth,
      accessUsers: ['serviceProviderAdmin', 'serviceProviderSubAdmin'],
    });
    const shop = req?.query?.shop as string;

    if (!shop) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'shop is required to get data',
      );
    }
    const result = await productServices.getAllProductsByShopDashboard({
      shop,
    });
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'category wise products has retrieved successfully',
      data: result,
    });
  },
);

const getAllProductsByShop: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: ['serviceProviderAdmin', 'serviceProviderSubAdmin'],
  });
  const shop = req?.query?.shop as string;
  const sortedBy = req?.query?.sortedBy as TSortedBy;
  const sortType = req?.query?.sortType as TSortType;

  if (!shop) {
    throw new AppError(httpStatus.BAD_REQUEST, 'shop is required to get data');
  }
  if (!sortedByArray.some((each) => each === sortedBy)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `sortedBy must be any of ${sortedByArray.reduce((total, current) => {
        total = total + `${current}, `;
        return total;
      }, '')}`,
    );
  }

  if (!sortTypeArray.some((each) => each === sortType)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `sortType must be any of ${sortTypeArray.reduce((total, current) => {
        total = total + `${current}, `;
        return total;
      }, '')}`,
    );
  }
  const result = await productServices.getAllProductsByShop({
    shop,
    sortedBy,
    sortType,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'all products has retrieved successfully',
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
  editProduct,
  addReview,
  getAllProducts,
  getAllProductsCategoryWise,
  getAllProductsByShopDashboard,
  getAllProductsByShop,
  getProductByProduct_id,
};

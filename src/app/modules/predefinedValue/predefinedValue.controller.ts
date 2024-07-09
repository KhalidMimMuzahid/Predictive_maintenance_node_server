import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { TAuth } from '../../interface/error';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { predefinedValueServices } from './predefinedValue.service';

const addProductCategories: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
  const category: string = req?.query?.category as string;
  if (!category) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'category is required to add product category',
    );
  }
  const result = await predefinedValueServices.addProductCategories(category);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product category has added successfully',
    data: result,
  });
});

const addProductSubCategories: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });

  const predefinedValue: string = req?.query?.predefinedValue as string; // _id of existing redefinedValue
  const category: string = req?.query?.category as string; // _id of existing category
  const subCategory: string = req?.query?.subCategory as string; // sub category value

  if (!category) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'category is required to add product category',
    );
  }
  const result = await predefinedValueServices.addProductSubCategories({
    predefinedValue,
    category,
    subCategory,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product sub-category has added successfully',
    data: result,
  });
});

const addShopCategories: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
  const category: string = req?.query?.category as string;
  if (!category) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'category is required to add shop category',
    );
  }
  const result = await predefinedValueServices.addShopCategories(category);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product category has added successfully',
    data: result,
  });
});

const addIotSectionName: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
  const sectionName: string = req?.query?.sectionName as string;
  if (!sectionName) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'sectionName is required to add IOT sectionName',
    );
  }
  const result = await predefinedValueServices.addIotSectionName(sectionName);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product category has added successfully',
    data: result,
  });
});
export const predefinedValueController = {
  addProductCategories,
  addProductSubCategories,
  addShopCategories,
  addIotSectionName,
};

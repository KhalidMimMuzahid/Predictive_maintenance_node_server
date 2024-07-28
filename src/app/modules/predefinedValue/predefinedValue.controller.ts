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


const addReservationRequestStatus: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
    const status: string = req?.query?.status as string;
    if (!status) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'status is required to add reservation request status',
      );
    }
    const result =
      await predefinedValueServices.addReservationRequestStatus(status);
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'reservation request status has added successfully',
      data: result,
    });
  },
);

const addReservationRequestNearestLocation: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
    const nearestLocation: string = req?.query?.nearestLocation as string;
    if (!nearestLocation) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'nearestLocation is required to add reservation request nearestLocation',
      );
    }
    const result =
      await predefinedValueServices.addReservationRequestNearestLocation(
        nearestLocation,
      );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'reservation request nearestLocation has added successfully',
      data: result,
    });
  },
);

const addReservationRequestArea: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
    const area: string = req?.query?.area as string;
    if (!area) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'area is required to add reservation request area',
      );
    }
    const result =
      await predefinedValueServices.addReservationRequestArea(area);
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'reservation request Area has added successfully',
      data: result,
    });
  },
);
const addReservationRequestIssue: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
    const issue: string = req?.query?.issue as string;
    if (!issue) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'issue is required to add reservation request issue',
      );
    }
    const result =
      await predefinedValueServices.addReservationRequestIssue(issue);
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'reservation request Issue has added successfully',
      data: result,
    });
  },
);

const getProductCategories: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });

  const result = await predefinedValueServices.getProductCategories();
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product categories have retrieved successfully',
    data: result,
  });
});

const getShopCategories: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: [
      'showaAdmin',
      'serviceProviderAdmin',
      'serviceProviderSubAdmin',
    ],
  });

  const result = await predefinedValueServices.getShopCategories();
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'shop categories have retrieved successfully',
    data: result,
  });
});

const getIotSectionNames: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: ['showaUser'] });

  const result = await predefinedValueServices.getIotSectionNames();
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'iot section names have retrieved successfully',
    data: result,
  });
});

export const predefinedValueController = {
  addProductCategories,
  addProductSubCategories,
  addShopCategories,
  addIotSectionName,

  addReservationRequestStatus,
  addReservationRequestNearestLocation,
  addReservationRequestArea,
  addReservationRequestIssue,

  getProductCategories,
  getShopCategories,
  getIotSectionNames,
};

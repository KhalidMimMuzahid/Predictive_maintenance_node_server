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
  const result = await predefinedValueServices.addProductCategories(
    category.toLowerCase(),
  );
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

  if (!category || !subCategory) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'category and subCategory are required to add product category',
    );
  }
  const result = await predefinedValueServices.addProductSubCategories({
    predefinedValue,
    category,
    subCategory: subCategory.toLowerCase(),
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
  const result = await predefinedValueServices.addShopCategories(
    category.toLowerCase(),
  );
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
  const result = await predefinedValueServices.addIotSectionName(
    sectionName?.toLowerCase(),
  );
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product category has added successfully',
    data: result,
  });
});

const addMachineBrandName: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
  const brandName: string = req?.query?.brandName as string;
  if (!brandName) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'brandName is required to add model brandName',
    );
  }
  const result = await predefinedValueServices.addMachineBrandName(
    brandName.toLowerCase(),
  );
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product category has added successfully',
    data: result,
  });
});

const addMachineModelName: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });

  const predefinedValue: string = req?.query?.predefinedValue as string; // _id of existing redefinedValue
  const brand: string = req?.query?.brand as string; // _id of existing brand
  const modelName: string = req?.query?.modelName as string; // sub category value

  if (!brand) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'brand and modelName are required to add machine model',
    );
  }
  const result = await predefinedValueServices.addMachineModelName({
    predefinedValue,
    brand,
    modelName: modelName.toLowerCase(),
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'product sub-category has added successfully',
    data: result,
  });
});
const addMachineIssue: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });

  const brandName: string = req?.query?.brandName as string;
  const modelName: string = req?.query?.modelName as string;
  const issue: string = req?.query?.issue as string;

  if (!brandName || !modelName || !issue) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'brand, model and issue Name are required to add machine issue model wise',
    );
  }
  const result = await predefinedValueServices.addMachineIssue({
    brandName: brandName?.toLowerCase(),
    modelName: modelName.toLowerCase(),
    issue: issue?.toLowerCase(),
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'machine issue has added successfully',
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
    const radiusString: string = req?.query?.radius as string;
    const radius: number = parseInt(radiusString);
    if (!radius) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'radius is required to add reservation request  nearestLocation',
      );
    }
    const result =
      await predefinedValueServices.addReservationRequestNearestLocation(
        radius,
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

const setReservationRequestNearestLocation: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
    const radiusString: string = req?.query?.radius as string;
    const radius: number = parseInt(radiusString);
    if (!radius) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'radius is required to set reservation request  nearestLocation',
      );
    }
    const result =
      await predefinedValueServices.setReservationRequestNearestLocation(
        radius,
      );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'reservation request nearestLocation has set successfully',
      data: result,
    });
  },
);

const getReservationRequestNearestLocation: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({
      auth,
      accessUsers: ['showaAdmin'],
    });

    const result =
      await predefinedValueServices.getReservationRequestNearestLocation();
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        'reservation request nearest location have retrieved successfully',
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
  checkUserAccessApi({ auth, accessUsers: ['showaUser', 'showaAdmin'] });

  const result = await predefinedValueServices.getIotSectionNames();
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'iot section names have retrieved successfully',
    data: result,
  });
});
const getMachineBrands: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });

  const result = await predefinedValueServices.getMachineBrands();
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'machine brands have retrieved successfully',
    data: result,
  });
});

const getAllMachineIssuesBrandAndModelWise: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({
      auth,
      accessUsers: 'all',
    });
    const brandName: string = req?.query?.brandName as string;
    const modelName: string = req?.query?.modelName as string;

    if (!brandName || !modelName) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'brand and model  Name are required to get machine all issue model wise',
      );
    }
    const result =
      await predefinedValueServices.getAllMachineIssuesBrandAndModelWise({
        brandName,
        modelName,
      });
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'machine issues have retrieved successfully',
      data: result,
    });
  },
);

export const predefinedValueController = {
  addProductCategories,
  addProductSubCategories,
  addShopCategories,
  addIotSectionName,
  addMachineBrandName,
  addMachineModelName,
  addMachineIssue,

  addReservationRequestStatus,
  addReservationRequestNearestLocation,
  setReservationRequestNearestLocation,
  getReservationRequestNearestLocation,
  addReservationRequestArea,
  addReservationRequestIssue,

  getProductCategories,
  getShopCategories,
  getIotSectionNames,
  getMachineBrands,
  getAllMachineIssuesBrandAndModelWise,
};

import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { TAuth } from '../../interface/error';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { predefinedValueServices } from './predefinedValue.service';
import { TMachineCategory } from '../machine/machine.interface';
import { TTransactionFeeType } from './predefinedValue.interface';
import { transactionFeeTypesArray } from './predefinedValue.const';

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

// const addIotSectionName: RequestHandler = catchAsync(async (req, res) => {
//   const auth: TAuth = req?.headers?.auth as unknown as TAuth;

//   // we are checking the permission of this api
//   checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
//   const sectionName: string = req?.query?.sectionName as string;
//   if (!sectionName) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'sectionName is required to add IOT sectionName',
//     );
//   }
//   const result = await predefinedValueServices.addIotSectionName(
//     sectionName?.toLowerCase(),
//   );
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'IOT section name has added successfully',
//     data: result,
//   });
// });

const addIotSectionName: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });

  const category: TMachineCategory = req?.query?.category as TMachineCategory;
  const type: string = req?.query?.type as string;
  const sectionName: string = req?.query?.sectionName as string;
  if (!category || !type || !sectionName) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'category, type and   const sectionNames are required to add machine issue model wise',
    );
  }
  if (category !== 'general-machine' && category !== 'washing-machine') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'category must be any of general-machine or washing-machine',
    );
  }

  const result = await predefinedValueServices.addIotSectionName({
    category: category,
    type: type?.toLowerCase(),
    sectionName: sectionName?.toLowerCase(),
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'IOT section name has added successfully',
    data: result,
  });
});
const deleteIotSectionNames: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });

  const category: TMachineCategory = req?.query?.category as TMachineCategory;
  const type: string = req?.query?.type as string;
  const sectionName: string = req?.query?.sectionName as string;
  if (!category || !type || !sectionName) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'category, type and   const sectionNames are required to add machine issue model wise',
    );
  }
  if (category !== 'general-machine' && category !== 'washing-machine') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'category must be any of general-machine or washing-machine',
    );
  }

  const result = await predefinedValueServices.deleteIotSectionNames({
    category: category,
    type: type?.toLowerCase(),
    sectionName: sectionName?.toLowerCase(),
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'IOT section name has deleted successfully',
    data: result,
  });
});

const addMachineBrandName: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
  const category: TMachineCategory = req?.query?.category as TMachineCategory;
  const type: string = req?.query?.type as string;
  const brandName: string = req?.query?.brandName as string;

  if (!brandName || !category || !type) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'brandName, category and type are required to add model brandName',
    );
  }

  if (category !== 'general-machine' && category !== 'washing-machine') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'category must be any of general-machine or washing-machine',
    );
  }
  const result = await predefinedValueServices.addMachineBrandName({
    category: category,
    type: type.toLowerCase(),
    brandName: brandName.toLowerCase(),
  });
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

  const predefinedValue: string = req?.query?.predefinedValue as string; // _id of existing predefinedValue

  const category: TMachineCategory = req?.query?.category as TMachineCategory;
  const type: string = req?.query?.type as string;

  const brand: string = req?.query?.brand as string; // _id of existing brand
  const modelName: string = req?.query?.modelName as string; // sub category value

  if (!category || !type || !brand || !modelName) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'category, type, brand and modelName are required to add machine model',
    );
  }
  const result = await predefinedValueServices.addMachineModelName({
    predefinedValue,
    category,
    type,
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
  const category: TMachineCategory = req?.query?.category as TMachineCategory;
  const type: string = req?.query?.type as string;
  const brandName: string = req?.query?.brandName as string;
  const modelName: string = req?.query?.modelName as string;
  const issue: string = req?.query?.issue as string;

  if (!category || !type || !brandName || !modelName || !issue) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'category, type, brand, model and issue Name are required to add machine issue model wise',
    );
  }
  if (category !== 'general-machine' && category !== 'washing-machine') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'category must be any of general-machine or washing-machine',
    );
  }
  const result = await predefinedValueServices.addMachineIssue({
    category: category,
    type: type?.toLowerCase(),
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
const addGeneralOrWashingMachineType: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
    const category: TMachineCategory = req?.query?.category as TMachineCategory;
    const type: string = req?.query?.type as string;

    if (!category || !type) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'category and type are required to add machine specific type',
      );
    }
    if (category !== 'general-machine' && category !== 'washing-machine') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'category must be any of general-machine or washing-machine',
      );
    }
    const result = await predefinedValueServices.addGeneralOrWashingMachineType(
      {
        category: category,
        type: type?.toLowerCase(),
      },
    );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'machine type has added successfully',
      data: result,
    });
  },
);

const setTransactionFeeForWallet: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
    const transactionFeeType: TTransactionFeeType = req?.query
      ?.transactionFeeType as TTransactionFeeType;
    const transactionFeeString: string = req?.query?.transactionFee as string;
    const transactionFee: number = parseInt(transactionFeeString);

    if (!transactionFee) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'transactionFee is required to set transaction fee',
      );
    }
    if (!transactionFeeTypesArray.some((each) => each === transactionFeeType)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `transactionFeeType must be any of ${transactionFeeTypesArray.reduce(
          (total, current) => {
            total = total + `${current}, `;
            return total;
          },
          '',
        )}`,
      );
    }
    const result = await predefinedValueServices.setTransactionFeeForWallet({
      transactionFee,
      transactionFeeType,
    });
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'machine type has added successfully',
      data: result,
    });
  },
);

const getTransactionFeeForWallet: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
    const transactionFeeType: TTransactionFeeType = req?.query
      ?.transactionFeeType as TTransactionFeeType;

    if (!transactionFeeTypesArray.some((each) => each === transactionFeeType)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `transactionFeeType must be any of ${transactionFeeTypesArray.reduce(
          (total, current) => {
            total = total + `${current}, `;
            return total;
          },
          '',
        )}`,
      );
    }
    const result =
      await predefinedValueServices.getTransactionFeeForWallet(
        transactionFeeType,
      );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'predefined value for wallet has retrieved successfully',
      data: result,
    });
  },
);
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

// const getIotSectionNames: RequestHandler = catchAsync(async (req, res) => {
//   const auth: TAuth = req?.headers?.auth as unknown as TAuth;

//   // we are checking the permission of this api
//   checkUserAccessApi({ auth, accessUsers: ['showaUser', 'showaAdmin'] });

//   const result = await predefinedValueServices.getIotSectionNames();
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'iot section names have retrieved successfully',
//     data: result,
//   });
// });

const getIotSectionNames: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });
  const category: TMachineCategory = req?.query?.category as TMachineCategory;
  const type: string = req?.query?.type as string;

  if (!category || !type) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'category and type names are required to get all machine issue model wise',
    );
  }
  const result = await predefinedValueServices.getIotSectionNames({
    category,
    type,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'IOT section names have retrieved successfully',
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
  const category: TMachineCategory = req?.query?.category as TMachineCategory;
  const type: string = req?.query?.type as string;

  if (!category || !type) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'category and type are required get brandName',
    );
  }

  if (category !== 'general-machine' && category !== 'washing-machine') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'category must be any of general-machine or washing-machine',
    );
  }
  const result = await predefinedValueServices.getMachineBrands({
    category,
    type,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'machine brands have retrieved successfully',
    data: result,
  });
});

const getMachineModels: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });
  const category: TMachineCategory = req?.query?.category as TMachineCategory;
  const type: string = req?.query?.type as string;
  const brand: string = req?.query?.brand as string;
  if (!category || !type || !brand) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'category, type and brand are required get brandName',
    );
  }

  if (category !== 'general-machine' && category !== 'washing-machine') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'category must be any of general-machine or washing-machine',
    );
  }
  const result = await predefinedValueServices.getMachineModels({
    category,
    type,
    brand,
  });
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
    const category: TMachineCategory = req?.query?.category as TMachineCategory;
    const type: string = req?.query?.type as string;
    const brandName: string = req?.query?.brandName as string;
    const modelName: string = req?.query?.modelName as string;

    if (!category || !type || !brandName || !modelName) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'category, type, brand, model Name are required to get all machine issue model wise',
      );
    }
    const result =
      await predefinedValueServices.getAllMachineIssuesBrandAndModelWise({
        category,
        type,
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
const getAllMachineTypesCategoryWise: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({
      auth,
      accessUsers: 'all',
    });
    const category: TMachineCategory = req?.query?.category as TMachineCategory;

    if (category !== 'general-machine' && category !== 'washing-machine') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'category must be any of general-machine or washing-machine',
      );
    }
    const result = await predefinedValueServices.getAllMachineTypesCategoryWise(
      {
        category,
      },
    );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'machine types have retrieved successfully',
      data: result,
    });
  },
);

export const predefinedValueController = {
  addProductCategories,
  addProductSubCategories,
  addShopCategories,

  // addIotSectionName,
  // addIotSectionName2,
  addIotSectionName,
  deleteIotSectionNames,

  addMachineBrandName,
  addMachineModelName,
  addMachineIssue,
  addGeneralOrWashingMachineType,

  setTransactionFeeForWallet,
  getTransactionFeeForWallet,

  addReservationRequestStatus,
  addReservationRequestNearestLocation,
  setReservationRequestNearestLocation,
  getReservationRequestNearestLocation,
  addReservationRequestArea,
  addReservationRequestIssue,

  getProductCategories,
  getShopCategories,
  // getIotSectionNames,
  getIotSectionNames,
  getMachineBrands,
  getMachineModels,
  getAllMachineIssuesBrandAndModelWise,
  getAllMachineTypesCategoryWise,
};

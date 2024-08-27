import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import PredefinedValue from './predefinedValue.model';
import { TPredefinedValue } from './predefinedValue.interface';
import mongoose from 'mongoose';

const addProductCategories = async (category: string) => {
  const previousProductCategories = await PredefinedValue.findOne(
    {
      type: 'marketplace',
      'marketplace.type': 'product',
    },
    { 'marketplace.product.categories': 1 },
  );
  if (previousProductCategories) {
    previousProductCategories.marketplace.product.categories.push({
      category: category,
      subCategories: [],
    });

    const updatedPreviousProductCategories =
      await previousProductCategories.save();
    if (!updatedPreviousProductCategories) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  } else {
    const newProductCategories: TPredefinedValue = {
      type: 'marketplace',
      marketplace: {
        type: 'product',
        product: {
          categories: [
            {
              category: category,
              subCategories: [],
            },
          ],
        },
      },
    };
    const createdProductCategories =
      await PredefinedValue.create(newProductCategories);

    if (!createdProductCategories) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  }
};
const addProductSubCategories = async ({
  predefinedValue,
  category,
  subCategory,
}: {
  predefinedValue: string;
  category: string;
  subCategory: string;
}) => {
  // const previousProductCategories = await PredefinedValue.findOne(
  //   {
  //     type: 'marketplace',
  //     'marketplace.type': 'product',
  //   },
  //   { 'marketplace.product.categories': 1 },
  // );
  const updatedPredefinedValue = await PredefinedValue.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(predefinedValue),
      'marketplace.product.categories._id': new mongoose.Types.ObjectId(
        category,
      ),
    },
    {
      $push: {
        'marketplace.product.categories.$.subCategories': subCategory,
      },
    },
  );

  if (!updatedPredefinedValue) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Something went wrong, please try again',
    );
  }

  return null;
};
const addShopCategories = async (category: string) => {
  const previousShopCategories = await PredefinedValue.findOne(
    {
      type: 'marketplace',
      'marketplace.type': 'shop',
    },
    { 'marketplace.shop.categories': 1 },
  );
  if (previousShopCategories) {
    previousShopCategories.marketplace.shop.categories.push(category);

    const updatedPreviousShopCategories = await previousShopCategories.save();
    if (!updatedPreviousShopCategories) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  } else {
    const newShopCategories: TPredefinedValue = {
      type: 'marketplace',
      marketplace: {
        type: 'shop',
        shop: {
          categories: [category],
        },
      },
    };
    const createdShopCategories =
      await PredefinedValue.create(newShopCategories);

    if (!createdShopCategories) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  }
};
const addIotSectionName = async (sectionName: string) => {
  const previousSectionNames = await PredefinedValue.findOne(
    {
      type: 'sensorModuleAttached',
    },
    { 'sensorModuleAttached.sectionNames': 1 },
  );

  if (previousSectionNames) {
    previousSectionNames?.sensorModuleAttached?.sectionNames?.push(sectionName);

    const updatedPreviousSectionNames = await previousSectionNames.save();

    if (!updatedPreviousSectionNames) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  } else {
    const newSections: TPredefinedValue = {
      type: 'sensorModuleAttached',
      sensorModuleAttached: {
        sectionNames: [sectionName],
      },
    };

    const createdNewSections = await PredefinedValue.create(newSections);
    if (!createdNewSections) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  }
};

const addMachineBrandName = async (brandName: string) => {


  const machineBrands = await PredefinedValue.findOne(
    {
      type: 'machine',
    },
    { 'machine.brands': 1 },
  );
  const brandsList =
    machineBrands?.machine?.brands?.map((each) => each?.brand) || [];

  if (brandsList?.findIndex((each) => each === brandName) !== -1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `brand Name cannot be duplicated`,
    );
  }




  const previousMachineBrandsNames = await PredefinedValue.findOne(
    {
      type: 'machine',
    },
    { 'machine.brands': 1 },
  );
  if (previousMachineBrandsNames) {
    previousMachineBrandsNames.machine?.brands.push({
      brand: brandName,
      models: [],
    });

    const updatedPreviousMachineBrandsNames =
      await previousMachineBrandsNames.save();
    if (!updatedPreviousMachineBrandsNames) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  } else {
    const newMachineBrandNames: TPredefinedValue = {
      type: 'machine',
      machine: {
        brands: [
          {
            brand: brandName,
            models: [],
          },
        ],
      },
    };
    const createdMachineBrandNames =
      await PredefinedValue.create(newMachineBrandNames);

    if (!createdMachineBrandNames) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  }
};

const addMachineModelName = async ({
  predefinedValue,
  brand,
  modelName,
}: {
  predefinedValue: string;
  brand: string;
  modelName: string;
}) => {
  const updatedPredefinedValue = await PredefinedValue.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(predefinedValue),
      'machine.brands._id': new mongoose.Types.ObjectId(brand),
    },
    {
      $push: {
        'machine.brands.$.models': modelName,
      },
    },
  );

  if (!updatedPredefinedValue) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Something went wrong, please try again',
    );
  }

  return null;
};

const addReservationRequestStatus = async (status: string) => {
  const previousStatus = await PredefinedValue.findOne(
    {
      type: 'reservationRequest',
    },
    { 'reservationRequest.statuses': 1 },
  );

  if (previousStatus) {
    previousStatus?.reservationRequest?.statuses?.push(status);

    const updatedPreviousStatus = await previousStatus.save();

    if (!updatedPreviousStatus) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  } else {
    const newStatus: TPredefinedValue = {
      type: 'reservationRequest',
      reservationRequest: {
        statuses: [status],
        areas: [],
        issues: [],
        nearestLocations: [],
      },
    };

    const createdStatus = await PredefinedValue.create(newStatus);
    if (!createdStatus) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  }
};

const addReservationRequestNearestLocation = async (
  nearestLocation: string,
) => {
  const previousNearestLocation = await PredefinedValue.findOne(
    {
      type: 'reservationRequest',
    },
    { 'reservationRequest.nearestLocations': 1 },
  );

  if (previousNearestLocation) {
    previousNearestLocation?.reservationRequest?.nearestLocations?.push(
      nearestLocation,
    );

    const updatedNearestLocation = await previousNearestLocation.save();

    if (!updatedNearestLocation) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  } else {
    const newNearestLocation: TPredefinedValue = {
      type: 'reservationRequest',
      reservationRequest: {
        nearestLocations: [nearestLocation],
        areas: [],
        issues: [],
        statuses: [],
      },
    };

    const createdNearestLocation =
      await PredefinedValue.create(newNearestLocation);
    if (!createdNearestLocation) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  }
};

const addReservationRequestArea = async (area: string) => {
  const previousArea = await PredefinedValue.findOne(
    {
      type: 'reservationRequest',
    },
    { 'reservationRequest.areas': 1 },
  );

  if (previousArea) {
    previousArea?.reservationRequest?.areas?.push(area);

    const updatedArea = await previousArea.save();

    if (!updatedArea) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  } else {
    const newArea: TPredefinedValue = {
      type: 'reservationRequest',
      reservationRequest: {
        nearestLocations: [],
        areas: [area],
        issues: [],
        statuses: [],
      },
    };

    const createdArea = await PredefinedValue.create(newArea);
    if (!createdArea) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  }
};

const addReservationRequestIssue = async (issue: string) => {
  const previousIssue = await PredefinedValue.findOne(
    {
      type: 'reservationRequest',
    },
    { 'reservationRequest.issues': 1 },
  );

  if (previousIssue) {
    previousIssue?.reservationRequest?.issues?.push(issue);

    const updatedIssue = await previousIssue.save();

    if (!updatedIssue) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  } else {
    const newIssue: TPredefinedValue = {
      type: 'reservationRequest',
      reservationRequest: {
        nearestLocations: [],
        areas: [],
        issues: [issue],
        statuses: [],
      },
    };

    const createdIssue = await PredefinedValue.create(newIssue);
    if (!createdIssue) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  }
};

const getIotSectionNames = async () => {
  const previousSectionNames = await PredefinedValue.findOne(
    {
      type: 'sensorModuleAttached',
    },
    { 'sensorModuleAttached.sectionNames': 1 },
  );
  return previousSectionNames?.sensorModuleAttached?.sectionNames || [];

  // const x = await Machine.updateMany(
  //   {},
  //   {
  //     $unset: { healthStatus: '' },
  //   },
  // );

  // return x;
};
const getProductCategories = async () => {
  const productCategories = await PredefinedValue.findOne(
    {
      type: 'marketplace',
      'marketplace.type': 'product',
    },
    { 'marketplace.product.categories': 1 },
  );
  return productCategories?.marketplace?.product?.categories || [];
  // return productCategories;
};

const getShopCategories = async () => {
  const shopCategories = await PredefinedValue.findOne(
    {
      type: 'marketplace',
      'marketplace.type': 'shop',
    },
    { 'marketplace.shop.categories': 1 },
  );
  return shopCategories?.marketplace?.shop?.categories || [];
  // return productCategories;
};

const getMachineBrands = async () => {
  const machineBrands = await PredefinedValue.findOne(
    {
      type: 'machine',
    },
    { 'machine.brands': 1 },
  );
  return machineBrands?.machine?.brands
    ? { brands: machineBrands?.machine?.brands, _id: machineBrands?._id }
    : null;
  
  // return productCategories;
};
export const predefinedValueServices = {
  addProductCategories,
  addProductSubCategories,
  addShopCategories,
  addIotSectionName,
  addMachineBrandName,
  addMachineModelName,
  addReservationRequestStatus,
  addReservationRequestNearestLocation,
  addReservationRequestArea,
  addReservationRequestIssue,

  getProductCategories,
  getShopCategories,
  getIotSectionNames,
  getMachineBrands,
}; 



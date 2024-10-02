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
  const previousMachineBrands = await PredefinedValue.findOne(
    {
      type: 'machine',
    },
    { 'machine.brands': 1 },
  );
  const brandsList =
    previousMachineBrands?.machine?.brands?.map((each) => each?.brand) || [];

  if (brandsList?.findIndex((each) => each === brandName) !== -1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `brand Name cannot be duplicated`,
    );
  }

  // const previousMachineBrandsNames = await PredefinedValue.findOne(
  //   {
  //     type: 'machine',
  //   },
  //   { 'machine.brands': 1 },
  // );
  if (previousMachineBrands) {
    const previousMachineBrandsNames =
      previousMachineBrands?.machine?.brands || [];
    previousMachineBrandsNames.push({
      brand: brandName,
      models: [],
    });
    previousMachineBrands.machine.brands = previousMachineBrandsNames;

    const updatedPreviousMachineBrandsNames =
      await previousMachineBrands.save();
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
        issues: [],
        types: [],
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
const addMachineIssue = async ({
  brandName,
  modelName,
  issue,
}: {
  brandName: string;
  modelName: string;
  issue: string;
}) => {
  const previousMachineIssues = await PredefinedValue.findOne(
    {
      type: 'machine',
    },
    { 'machine.issues': 1 },
  );
  let isDifferentBrandAndModel = false;
  if (previousMachineIssues) {
    const issuesList =
      previousMachineIssues?.machine?.issues?.map((each) => {
        if (each?.brand === brandName && each.model === modelName) {
          const issuesList = each?.issues?.map((each) => each) || [];

          if (issuesList?.findIndex((each) => each === issue) !== -1) {
            throw new AppError(
              httpStatus.BAD_REQUEST,
              `issue cannot be duplicated in a single model`,
            );
          } else {
            each?.issues?.push(issue);
            return each;
          }
        } else {
          // that means its a different brand and model
          isDifferentBrandAndModel = true;
          return each;
        }
      }) || [];
    if (isDifferentBrandAndModel || issuesList?.length === 0) {
      issuesList?.push({
        brand: brandName,
        model: modelName,
        issues: [issue],
      });
    }
    previousMachineIssues.machine.issues = issuesList;
    const updatedPreviousMachineIssuesList = await previousMachineIssues.save();
    if (!updatedPreviousMachineIssuesList) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  } else {
    const newMachineIssuesList: TPredefinedValue = {
      type: 'machine',
      machine: {
        brands: [],
        types: [],
        issues: [
          {
            brand: brandName,
            model: modelName,
            issues: [issue],
          },
        ],
      },
    };
    const createdMachineIssuesList =
      await PredefinedValue.create(newMachineIssuesList);

    if (!createdMachineIssuesList) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  }
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
        nearestLocations: {
          // selectedRadius: null,
          radiuses: [],
        },
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

const addReservationRequestNearestLocation = async (radius: number) => {
  const previousNearestLocation = await PredefinedValue.findOne(
    {
      type: 'reservationRequest',
    },
    { 'reservationRequest.nearestLocations': 1 },
  );

  if (previousNearestLocation) {
    previousNearestLocation?.reservationRequest?.nearestLocations?.radiuses?.push(
      radius,
    );
    previousNearestLocation.reservationRequest.nearestLocations.selectedRadius =
      radius;
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
        nearestLocations: {
          radiuses: [radius],
          selectedRadius: radius,
        },
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
const setReservationRequestNearestLocation = async (radius: number) => {
  const previousNearestLocation = await PredefinedValue.findOne(
    {
      type: 'reservationRequest',
    },
    { 'reservationRequest.nearestLocations': 1 },
  );

  if (previousNearestLocation) {
    previousNearestLocation.reservationRequest.nearestLocations.selectedRadius =
      radius;
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
        nearestLocations: {
          radiuses: [],
          selectedRadius: radius,
        },
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
const getReservationRequestNearestLocation = async () => {
  const preDefinedValue = await PredefinedValue.findOne(
    {
      type: 'reservationRequest',
    },
    { 'reservationRequest.nearestLocations': 1 },
  );

  return preDefinedValue?.reservationRequest?.nearestLocations;
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
        nearestLocations: {
          // selectedRadius: null,
          radiuses: [],
        },
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
        nearestLocations: {
          // selectedRadius: null,
          radiuses: [],
        },
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

const getAllMachineIssuesBrandAndModelWise = async ({
  brandName,
  modelName,
}: {
  brandName: string;
  modelName: string;
}) => {
  const machineIssueList = await PredefinedValue.aggregate([
    {
      $match: {
        type: 'machine',
      },
    },
    {
      $unwind: '$machine.issues',
    },
    {
      $replaceRoot: {
        newRoot: '$machine.issues',
      },
    },
    {
      $match: {
        brand: brandName,
        model: modelName,
      },
    },
  ]);


  return machineIssueList[0]?.issues || [];
};
export const predefinedValueServices = {
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



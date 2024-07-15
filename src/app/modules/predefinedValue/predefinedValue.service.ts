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
export const predefinedValueServices = {
  addProductCategories,
  addProductSubCategories,
  addShopCategories,
  addIotSectionName,

  getProductCategories,
  getShopCategories,
  getIotSectionNames,
}; 



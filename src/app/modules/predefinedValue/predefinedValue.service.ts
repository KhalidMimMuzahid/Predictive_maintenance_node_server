import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import PredefinedValue from './predefinedValue.model';
import {
  TPredefinedValue,
  TTransactionFeeType,
  TWallet,
} from './predefinedValue.interface';
import mongoose from 'mongoose';
import { TMachineCategory } from '../machine/machine.interface';

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
        sectionNames2: [],
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
const addIotSectionName2 = async ({
  category,
  type,
  sectionName,
}: {
  category: TMachineCategory;
  type: string;
  sectionName: string;
}) => {
  const previousSectionNames2 = await PredefinedValue.findOne(
    {
      type: 'sensorModuleAttached',
    },
    { 'sensorModuleAttached.sectionNames2': 1 },
  );

  let isDifferentCategoryAndType = true;
  if (previousSectionNames2) {
    const sectionNamesList =
      previousSectionNames2?.sensorModuleAttached?.sectionNames2?.map(
        (each) => {
          if (each?.category === category && each?.type === type) {
            const sectionNamesList =
              each?.sectionNames?.map((each) => each) || [];

            if (
              sectionNamesList?.findIndex((each) => each === sectionName) !== -1
            ) {
              throw new AppError(
                httpStatus.BAD_REQUEST,
                `sectionName cannot be duplicated in a single model`,
              );
            } else {
              each?.sectionNames?.push(sectionName);
              isDifferentCategoryAndType = false;
              return each;
            }
          } else {
            // that means its a different brand and model
            return each;
          }
        },
      ) || [];
    if (isDifferentCategoryAndType || sectionNamesList?.length === 0) {
      sectionNamesList?.push({
        category: category,
        type: type,
        sectionNames: [sectionName],
      });
    }
    previousSectionNames2.sensorModuleAttached.sectionNames2 = sectionNamesList;
    const updatedPreviousIOTsectionNamesList =
      await previousSectionNames2.save();
    if (!updatedPreviousIOTsectionNamesList) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  } else {
    const newIOTsectionNamesList: TPredefinedValue = {
      type: 'sensorModuleAttached',
      sensorModuleAttached: {
        sectionNames: [],
        sectionNames2: [
          {
            category: category,
            type: type,
            sectionNames: [sectionName],
          },
        ],
      },
    };
    const createdIOTsectionNamesList = await PredefinedValue.create(
      newIOTsectionNamesList,
    );

    if (!createdIOTsectionNamesList) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  }
};
const deleteIotSectionNames2 = async ({
  category,
  type,
  sectionName,
}: {
  category: TMachineCategory;
  type: string;
  sectionName: string;
}) => {
  // Update operation
  const result = await PredefinedValue.updateOne(
    {
      type: 'sensorModuleAttached', // Ensure we target the right type
      'sensorModuleAttached.sectionNames2.category': category,
      'sensorModuleAttached.sectionNames2.type': type,
    },
    {
      $pull: {
        'sensorModuleAttached.sectionNames2.$.sectionNames': sectionName,
      },
    },
  );

  if (result.modifiedCount === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, `no data found to delete`);
  }

  return null;
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
  category,
  type,
  brandName,
  modelName,
  issue,
}: {
  category: TMachineCategory;
  type: string;
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
        if (
          each?.category === category &&
          each?.type === type &&
          each?.brand === brandName &&
          each.model === modelName
        ) {
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
        category: category,
        type: type,
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
            category: category,
            type: type,
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
const addGeneralOrWashingMachineType = async ({
  category,
  type,
}: {
  category: TMachineCategory;
  type: string;
}) => {
  const previousMachineTypes = await PredefinedValue.findOne(
    {
      type: 'machine',
    },

    { 'machine.types': 1 },
  );
  let isDifferentCategory = false;
  if (previousMachineTypes) {
    const typesList =
      previousMachineTypes?.machine?.types?.map((each) => {
        if (each?.category === category) {
          const typeList = each?.types?.map((each) => each) || [];

          if (typeList?.findIndex((each) => each === type) !== -1) {
            throw new AppError(
              httpStatus.BAD_REQUEST,
              `type cannot be duplicated in a single machine category`,
            );
          } else {
            each?.types?.push(type);
            return each;
          }
        } else {
          // that means its a different brand and model
          isDifferentCategory = true;
          return each;
        }
      }) || [];
    if (isDifferentCategory || typesList?.length === 0) {
      typesList?.push({
        category: category,
        types: [type],
      });
    }
    previousMachineTypes.machine.types = typesList;
    const updatedPreviousMachineIssuesList = await previousMachineTypes.save();
    if (!updatedPreviousMachineIssuesList) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  } else {
    const newMachineTypesList: TPredefinedValue = {
      type: 'machine',
      machine: {
        brands: [],
        types: [
          {
            category: category,
            types: [type],
          },
        ],
        issues: [],
      },
    };
    const createdMachineTypessList =
      await PredefinedValue.create(newMachineTypesList);

    if (!createdMachineTypessList) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Something went wrong, please try again',
      );
    } else {
      return null;
    }
  }
};

const setTransactionFeeForWallet = async ({
  transactionFee,
  transactionFeeType,
}: {
  transactionFee: number;
  transactionFeeType: TTransactionFeeType;
}) => {
  const newPredefinedWalletForNew: TWallet = {
    bonus: {
      joiningBonus: {
        amount: 0,
      },
      referenceBonus: {
        amount: 0,
      },
    },
    walletInterchange: {
      pointToBalance: {
        transactionFee: 0,
      },
      balanceToShowaMB: {
        transactionFee: 0,
      },
    },
    payment: {
      productPurchase: {
        transactionFee: 0,
      },
      subscriptionPurchase: {
        transactionFee: 0,
      },
    },
    fundTransfer: {
      transactionFee: 0,
    },
    addFund: {
      card: {
        transactionFee: 0,
      },
      bankAccount: {
        transactionFee: 0,
      },
    },
  };

  if (transactionFeeType === 'bonus-joiningBonus') {
    const predefineValue = await PredefinedValue.findOne(
      {
        type: 'wallet',
      },
      { 'wallet.bonus': 1 },
    );

    if (predefineValue) {
      predefineValue.wallet.bonus.joiningBonus.amount = transactionFee;

      const updatedPredefineValue = await predefineValue.save();

      if (!updatedPredefineValue) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Something went wrong, please try again',
        );
      } else {
        return null;
      }
    } else {
      newPredefinedWalletForNew.bonus.joiningBonus.amount = transactionFee;

      const createdTransactionFee = await PredefinedValue.create({
        type: 'wallet',
        wallet: newPredefinedWalletForNew,
      });
      if (!createdTransactionFee) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Something went wrong, please try again',
        );
      } else {
        return null;
      }
    }
  } else if (transactionFeeType === 'bonus-referenceBonus') {
    const predefineValue = await PredefinedValue.findOne(
      {
        type: 'wallet',
      },
      { 'wallet.bonus': 1 },
    );

    if (predefineValue) {
      predefineValue.wallet.bonus.referenceBonus.amount = transactionFee;

      const updatedPredefineValue = await predefineValue.save();

      if (!updatedPredefineValue) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Something went wrong, please try again',
        );
      } else {
        return null;
      }
    } else {
      newPredefinedWalletForNew.bonus.referenceBonus.amount = transactionFee;

      const createdTransactionFee = await PredefinedValue.create({
        type: 'wallet',
        wallet: newPredefinedWalletForNew,
      });
      if (!createdTransactionFee) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Something went wrong, please try again',
        );
      } else {
        return null;
      }
    }
  } else if (transactionFeeType === 'walletInterchange-pointToBalance') {
    const predefineValue = await PredefinedValue.findOne(
      {
        type: 'wallet',
      },
      { 'wallet.walletInterchange': 1 },
    );

    if (predefineValue) {
      predefineValue.wallet.walletInterchange.pointToBalance.transactionFee =
        transactionFee;

      const updatedPredefineValue = await predefineValue.save();

      if (!updatedPredefineValue) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Something went wrong, please try again',
        );
      } else {
        return null;
      }
    } else {
      newPredefinedWalletForNew.walletInterchange.pointToBalance.transactionFee =
        transactionFee;

      const createdTransactionFee = await PredefinedValue.create({
        type: 'wallet',
        wallet: newPredefinedWalletForNew,
      });
      if (!createdTransactionFee) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Something went wrong, please try again',
        );
      } else {
        return null;
      }
    }
  } else if (transactionFeeType === 'walletInterchange-balanceToShowaMB') {
    const predefineValue = await PredefinedValue.findOne(
      {
        type: 'wallet',
      },
      { 'wallet.walletInterchange': 1 },
    );

    if (predefineValue) {
      predefineValue.wallet.walletInterchange.balanceToShowaMB.transactionFee =
        transactionFee;

      const updatedPredefineValue = await predefineValue.save();

      if (!updatedPredefineValue) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Something went wrong, please try again',
        );
      } else {
        return null;
      }
    } else {
      newPredefinedWalletForNew.walletInterchange.balanceToShowaMB.transactionFee =
        transactionFee;

      const createdTransactionFee = await PredefinedValue.create({
        type: 'wallet',
        wallet: newPredefinedWalletForNew,
      });
      if (!createdTransactionFee) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Something went wrong, please try again',
        );
      } else {
        return null;
      }
    }
  } else if (transactionFeeType === 'fundTransfer') {
    const predefineValue = await PredefinedValue.findOne(
      {
        type: 'wallet',
      },
      { 'wallet.fundTransfer': 1 },
    );

    if (predefineValue) {
      predefineValue.wallet.fundTransfer.transactionFee = transactionFee;

      const updatedPredefineValue = await predefineValue.save();

      if (!updatedPredefineValue) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Something went wrong, please try again',
        );
      } else {
        return null;
      }
    } else {
      newPredefinedWalletForNew.fundTransfer.transactionFee = transactionFee;

      const createdTransactionFee = await PredefinedValue.create({
        type: 'wallet',
        wallet: newPredefinedWalletForNew,
      });
      if (!createdTransactionFee) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Something went wrong, please try again',
        );
      } else {
        return null;
      }
    }
  } else if (transactionFeeType === 'payment-productPurchase') {
    const predefineValue = await PredefinedValue.findOne(
      {
        type: 'wallet',
      },
      { 'wallet.payment': 1 },
    );

    if (predefineValue) {
      predefineValue.wallet.payment.productPurchase.transactionFee =
        transactionFee;

      const updatedPredefineValue = await predefineValue.save();

      if (!updatedPredefineValue) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Something went wrong, please try again',
        );
      } else {
        return null;
      }
    } else {
      newPredefinedWalletForNew.payment.productPurchase.transactionFee =
        transactionFee;

      const createdTransactionFee = await PredefinedValue.create({
        type: 'wallet',
        wallet: newPredefinedWalletForNew,
      });
      if (!createdTransactionFee) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Something went wrong, please try again',
        );
      } else {
        return null;
      }
    }
  } else if (transactionFeeType === 'payment-subscriptionPurchase') {
    const predefineValue = await PredefinedValue.findOne(
      {
        type: 'wallet',
      },
      { 'wallet.payment': 1 },
    );

    if (predefineValue) {
      predefineValue.wallet.payment.subscriptionPurchase.transactionFee =
        transactionFee;

      const updatedPredefineValue = await predefineValue.save();

      if (!updatedPredefineValue) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Something went wrong, please try again',
        );
      } else {
        return null;
      }
    } else {
      newPredefinedWalletForNew.payment.subscriptionPurchase.transactionFee =
        transactionFee;

      const createdTransactionFee = await PredefinedValue.create({
        type: 'wallet',
        wallet: newPredefinedWalletForNew,
      });
      if (!createdTransactionFee) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Something went wrong, please try again',
        );
      } else {
        return null;
      }
    }
  } else if (transactionFeeType === 'addFund-card') {
    const predefineValue = await PredefinedValue.findOne(
      {
        type: 'wallet',
      },
      { 'wallet.addFund': 1 },
    );

    if (predefineValue) {
      predefineValue.wallet.addFund.card.transactionFee = transactionFee;

      const updatedPredefineValue = await predefineValue.save();

      if (!updatedPredefineValue) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Something went wrong, please try again',
        );
      } else {
        return null;
      }
    } else {
      newPredefinedWalletForNew.addFund.card.transactionFee = transactionFee;

      const createdTransactionFee = await PredefinedValue.create({
        type: 'wallet',
        wallet: newPredefinedWalletForNew,
      });
      if (!createdTransactionFee) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Something went wrong, please try again',
        );
      } else {
        return null;
      }
    }
  } else if (transactionFeeType === 'addFund-bankAccount') {
    const predefineValue = await PredefinedValue.findOne(
      {
        type: 'wallet',
      },
      { 'wallet.addFund': 1 },
    );

    if (predefineValue) {
      predefineValue.wallet.addFund.bankAccount.transactionFee = transactionFee;

      const updatedPredefineValue = await predefineValue.save();

      if (!updatedPredefineValue) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Something went wrong, please try again',
        );
      } else {
        return null;
      }
    } else {
      newPredefinedWalletForNew.addFund.bankAccount.transactionFee =
        transactionFee;

      const createdTransactionFee = await PredefinedValue.create({
        type: 'wallet',
        wallet: newPredefinedWalletForNew,
      });
      if (!createdTransactionFee) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Something went wrong, please try again',
        );
      } else {
        return null;
      }
    }
  }
};

const getTransactionFeeForWallet = async (
  transactionFeeType: TTransactionFeeType,
) => {
  const predefineValue = await PredefinedValue.findOne(
    {
      type: 'wallet',
    },
    { wallet: 1 },
  );

  if (transactionFeeType === 'all') {
    return predefineValue.wallet;
  } else if (transactionFeeType === 'bonus-joiningBonus') {
    return predefineValue.wallet.bonus.joiningBonus.amount || 0;
  } else if (transactionFeeType === 'bonus-referenceBonus') {
    return predefineValue.wallet.bonus.referenceBonus.amount || 0;
  } else if (transactionFeeType === 'walletInterchange-pointToBalance') {
    return (
      predefineValue.wallet.walletInterchange.pointToBalance.transactionFee || 0
    );
  } else if (transactionFeeType === 'walletInterchange-balanceToShowaMB') {
    return (
      predefineValue.wallet.walletInterchange.balanceToShowaMB.transactionFee ||
      0
    );
  } else if (transactionFeeType === 'fundTransfer') {
    return predefineValue.wallet.fundTransfer.transactionFee || 0;
  } else if (transactionFeeType === 'payment-productPurchase') {
    return predefineValue.wallet.payment.productPurchase.transactionFee || 0;
  } else if (transactionFeeType === 'payment-subscriptionPurchase') {
    return (
      predefineValue.wallet.payment.subscriptionPurchase.transactionFee || 0
    );
  } else if (transactionFeeType === 'addFund-card') {
    return predefineValue.wallet.addFund.card.transactionFee || 0;
  } else if (transactionFeeType === 'addFund-bankAccount') {
    return predefineValue.wallet.addFund.bankAccount.transactionFee || 0;
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

const getIotSectionNames2 = async ({
  category,
  type,
}: {
  category: TMachineCategory;
  type: string;
}) => {
  const iotSectionNamesList = await PredefinedValue.aggregate([
    {
      $match: {
        type: 'sensorModuleAttached',
      },
    },
    {
      $unwind: '$sensorModuleAttached.sectionNames2',
    },
    {
      $replaceRoot: {
        newRoot: '$sensorModuleAttached.sectionNames2',
      },
    },
    {
      $match: {
        category: category,
        type: type,
      },
    },
  ]);

  return iotSectionNamesList[0]?.sectionNames || [];
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
  category,
  type,
  brandName,
  modelName,
}: {
  category: TMachineCategory;
  type: string;
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
        category: category,
        type: type,
        brand: brandName,
        model: modelName,
      },
    },
  ]);

  return machineIssueList[0]?.issues || [];
};

const getAllMachineTypesCategoryWise = async ({
  category,
}: {
  category: TMachineCategory;
}) => {
  const machineTypesList = await PredefinedValue.aggregate([
    {
      $match: {
        type: 'machine',
      },
    },
    {
      $unwind: '$machine.types',
    },
    {
      $replaceRoot: {
        newRoot: '$machine.types',
      },
    },
    {
      $match: {
        category: category,
      },
    },
  ]);

  return machineTypesList[0]?.types || [];
};
export const predefinedValueServices = {
  addProductCategories,
  addProductSubCategories,
  addShopCategories,

  addIotSectionName,
  addIotSectionName2,
  deleteIotSectionNames2,

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
  getIotSectionNames,
  getIotSectionNames2,
  getMachineBrands,
  getAllMachineIssuesBrandAndModelWise,
  getAllMachineTypesCategoryWise,
}; 



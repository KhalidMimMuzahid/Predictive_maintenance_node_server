import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { addDays } from '../../utils/addDays';
import {
  TBasic,
  TDiscount,
  TPremium,
  TShowaUser,
  TStandard,
} from '../subscription/subscription.interface';
import { Subscription } from '../subscription/subscription.model';
import {
  TPurchasedPrice,
  TShowaUserForUses,
  TSubscriptionPurchased,
  TUsage,
} from './subscriptionPurchased.interface';
import { SubscriptionPurchased } from './subscriptionPurchased.model';

const createSubscription = async ({
  user,
  subscription,
}: {
  user: mongoose.Types.ObjectId;
  subscription: string;
}) => {
  const subscriptionData = await Subscription.findById(
    new mongoose.Types.ObjectId(subscription),
  );
  if (!subscriptionData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no subscription has found with this subscription',
    );
  }

  const usage: TUsage = {};
  if (subscriptionData?.package?.packageFor === 'showaUser') {
    const showaUserForUses: TShowaUserForUses = {};
    const showaUser: TShowaUser = subscriptionData?.package?.showaUser;
    if (showaUser?.packageType === 'basic') {
      const basic: TBasic = showaUser?.basic;
      // console.log({ basic });
      showaUserForUses.totalAvailableIOT = basic?.totalIOT;
      showaUserForUses.IOTs = [];
      showaUserForUses.totalAvailableShowaMB = basic?.showaMB;
    } else if (showaUser?.packageType === 'standard') {
      const standard: TStandard = showaUser?.standard;
      showaUserForUses.totalAvailableMachine = standard?.totalMachine;
      showaUserForUses.machines = [];
      // console.log({ standard });
    } else if (showaUser?.packageType === 'premium') {
      const premium: TPremium = showaUser?.premium;
      showaUserForUses.totalAvailableMachine = premium?.totalMachine;
      showaUserForUses.machines = [];
      showaUserForUses.totalAvailableIOT = premium?.totalIOT;
      showaUserForUses.IOTs = [];
      // console.log({ premium });
    }

    usage.showaUser = showaUserForUses;
  } else if (
    subscriptionData?.package?.packageFor === 'serviceProviderCompany'
  ) {
    //
  }

  let applicablePrice: number = subscriptionData?.price?.netAmount;

  if (subscriptionData?.price?.discount) {
    const discount: TDiscount = subscriptionData?.price?.discount;
    if (discount?.type === 'flat-rate') {
      applicablePrice = discount?.amount;
    } else if (discount?.type === 'percentage') {
      applicablePrice =
        applicablePrice - (discount?.amount * applicablePrice) / 100;
    }
  }

  const tax: number = 0; //assume this tax quantity is coming frm database set by  showa admin; for now it's zero
  const totalPrice: number = applicablePrice + (tax * applicablePrice) / 100;

  const price: TPurchasedPrice = {
    tax: tax,
    applicablePrice: applicablePrice,
    totalPrice: totalPrice,
  };
  const expDate: Date = addDays(subscriptionData?.validity);
  const subscriptionPurchaseData = await SubscriptionPurchased.create({
    subscription: subscriptionData,
    user,
    isActive: true,
    usage,
    expDate,
    price,
  });
  return subscriptionPurchaseData;
};

const getAllMySubscriptions = async (userId: mongoose.Types.ObjectId) => {
  const purchases: TSubscriptionPurchased[] = await SubscriptionPurchased.find({
    user: userId,
    isActive: true,
  }).populate({
    path: 'subscription',
    //select: 'subscriptionTitle package price validity features',
  });

  if (!purchases.length) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'No subscriptions found for the user',
    );
  }

  return purchases;
};

const renewSubscription = async ({
  user,
  subscriptionPurchasedId,
  additionalValidityPeriod,
}: {
  user: mongoose.Types.ObjectId;
  subscriptionPurchasedId: string;
  additionalValidityPeriod: number;
}) => {
  const subscriptionPurchase = await SubscriptionPurchased.findOne({
    _id: subscriptionPurchasedId,
    user,
  });

  if (!subscriptionPurchase) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Subscription not found for the user',
    );
  }
  const currentExpDate = subscriptionPurchase.expDate;
  const newExpDate = new Date(
    currentExpDate.getTime() + additionalValidityPeriod * 24 * 60 * 60 * 1000,
  );

  subscriptionPurchase.expDate = newExpDate;
  await subscriptionPurchase.save();

  return subscriptionPurchase;
};

const getAllSubscriptionPurchasedHistoryByUser = async (userId: string) => {
  const subscriptions = await SubscriptionPurchased.find({
    user: new mongoose.Types.ObjectId(userId),
  }).populate('subscription');

  // const totalCount = await SubscriptionPurchased.countDocuments({
  //   user: userId,
  // });

  return {
    subscriptions,
  };
};

export const subscriptionPurchasedServices = {
  createSubscription,
  getAllMySubscriptions,
  renewSubscription,
  getAllSubscriptionPurchasedHistoryByUser,
};

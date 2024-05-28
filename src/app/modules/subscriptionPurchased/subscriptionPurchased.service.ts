import mongoose from 'mongoose';
import { Subscription } from '../subscription/subscription.model';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import {
  TBasic,
  TDiscount,
  TPremium,
  TShowaUser,
  TStandard,
} from '../subscription/subscription.interface';
import {
  TPurchasedPrice,
  TShowaUserForUses,
  TUsage,
} from './subscriptionPurchased.interface';
import { addDays } from '../../utils/addDays';
import { SubscriptionPurchased } from './subscriptionPurchased.model';

const createSubscription = async (subscription: string) => {
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
    isActive: true,
    usage,
    expDate,
    price,
  });
  return subscriptionPurchaseData;
};

export const subscriptionPurchasedServices = {
  createSubscription,
};

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
import { updateWallet } from '../wallet/wallet.utils';
import { Wallet } from '../wallet/wallet.model';
import { Transaction } from '../transaction/transaction.model';
import { TPayment } from '../transaction/transaction.interface';

const createSubscription = async ({
  user,
  subscription,
  specialContactServiceProviderCompany,
}: {
  user: mongoose.Types.ObjectId;
  subscription: string;
  specialContactServiceProviderCompany: mongoose.Types.ObjectId;
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

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const subscriptionPurchaseDataArray = await SubscriptionPurchased.create(
      [
        {
          subscription: subscriptionData,
          user,
          specialContactServiceProviderCompany:
            specialContactServiceProviderCompany || undefined,
          isActive: true,
          usage,
          expDate,
          price,
        },
      ],
      { session },
    );
    const subscriptionPurchaseData = subscriptionPurchaseDataArray[0];
    if (!subscriptionPurchaseData) {
      {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Something went wrong, please try again',
        );
      }
    }

    const walletData = await Wallet.findOne({ user, ownerType: 'user' }).select(
      'balance point showaMB',
    );

    if (totalPrice > walletData?.balance) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'You have not enough money to purchase, please add fund first',
      );
    }
    const updatedWallet = await updateWallet({
      session: session,
      wallet: walletData?._id,
      balance: -totalPrice,
      point: Math.ceil(totalPrice / 100),
    });
    if (!updatedWallet) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Something went wrong, please try again',
      );
    }
    const payment: TPayment = {
      type: 'subscriptionPurchase',
      subscriptionPurchase: {
        user: user,
        subscriptionPurchased: subscriptionPurchaseData?._id,
        price: price,
      },
      walletStatus: {
        previous: {
          balance: walletData?.balance,
          point: walletData?.point,
          showaMB: walletData?.showaMB,
        },
        next: {
          balance: walletData?.balance - totalPrice,
          point: walletData?.point + Math.ceil(totalPrice / 100),
          showaMB: walletData?.showaMB,
        },
      },
    };
    const createdTransactionArray = await Transaction.create(
      [
        {
          type: 'payment',
          payment: payment,
          status: 'completed',
        },
      ],
      { session },
    );
    const createdTransaction = createdTransactionArray[0];
    if (!createdTransaction) {
      {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Something went wrong, please try again',
        );
      }
    }

    await session.commitTransaction();
    await session.endSession();
    return subscriptionPurchaseData;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
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

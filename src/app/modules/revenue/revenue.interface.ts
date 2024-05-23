import mongoose from 'mongoose';

type TRevenueType =
  | 'subscriptionFee'
  | 'salesCommission'
  | 'advertising'
  | 'iotMBSelling';

export type TRevenue = {
  type: TRevenueType;
  subscriptionFee: {
    subscriptionPurchased: mongoose.Types.ObjectId; // SubscriptionPurchased
    subscriptionBy: 'serviceProviderCompany' | 'showaUser';
    serviceProviderCompany: {
      data: mongoose.Types.ObjectId; // serviceProviderCompany
    };
    showaUser: {
      data: mongoose.Types.ObjectId; // serviceProviderCompany
    };
  };

  revenueAmount: number;
};

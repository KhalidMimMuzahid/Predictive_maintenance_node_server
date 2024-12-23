import mongoose from 'mongoose';
import { TSubscription } from '../subscription/subscription.interface';

export type TShowaUserForUses = {
  machines?: mongoose.Types.ObjectId[];
  IOTs?: mongoose.Types.ObjectId[]; // IOT mean sensor modules attached
  totalAvailableMachine?: number;
  totalAvailableIOT?: number;
  totalAvailableShowaMB?: number;
};

export type TServiceProviderCompanyForUses = {
  totalAvailableBranch: number;
  totalAvailableVendor: number;
  totalAvailableReservationAllowed: 'unlimited' | number;
  totalAvailableReservationAcceptable: 'unlimited' | number;

  serviceProviderBranches?: mongoose.Types.ObjectId[];
  serviceProviderBranchesAsVendor?: mongoose.Types.ObjectId[];
};

export type TUsage = {
  showaUser?: TShowaUserForUses;
  serviceProviderCompany?: TServiceProviderCompanyForUses;
  // serviceProviderAdmin?: { engineers: mongoose.Types.ObjectId[] };
};

export type TPurchasedPrice = {
  tax: number; // percentage; coming from mongodb set by showa admin;
  applicablePrice: number; // this applicable price is calculated automatically if this package has any offers
  totalPrice: number; //  applicablePrice+ ((applicablePrice*tax)/100)
};
export type TSubscriptionPurchased = {
  subscription: TSubscription & {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  };

  // this field is available when type is showaUser
  // --------------------------- XXXX ---------------------------
  specialContactServiceProviderCompany?: mongoose.Types.ObjectId; // if this coupon is for special contact with service provider
  user: mongoose.Types.ObjectId; // user id of showa user
  // --------------------------- XXXX ---------------------------
  // this field is available when type is serviceProviderCompany
  // --------------------------- XXXX ---------------------------
  serviceProviderCompany?: mongoose.Types.ObjectId; // if this coupon is for special contact with service provider
  // --------------------------- XXXX ---------------------------

  isActive: boolean;
  usage: TUsage;
  expDate: Date;
  price: TPurchasedPrice;
};

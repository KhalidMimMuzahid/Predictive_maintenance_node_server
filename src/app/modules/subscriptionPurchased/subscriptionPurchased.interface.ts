import mongoose from 'mongoose';
import { TSubscription } from '../subscription/subscription.interface';

export type TShowaUserForUses = {
  machines?: mongoose.Types.ObjectId[];
  IOTs?: mongoose.Types.ObjectId[]; // IOT mean sensor modules attached
  totalAvailableMachine?: number;
  totalAvailableIOT?: number;
  totalAvailableShowaMB?: number;
};

export type TUsage = {
  showaUser?: TShowaUserForUses;
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

  user: mongoose.Types.ObjectId;
  isActive: boolean;
  usage: TUsage;
  expDate: Date;
  price: TPurchasedPrice;
};

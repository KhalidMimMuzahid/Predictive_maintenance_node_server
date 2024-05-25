import mongoose from 'mongoose';
import { TSubscription } from '../subscription/subscription.interface';

export type TUses = {
  showaUser?: {
    machines?: mongoose.Types.ObjectId[];
    IOTs?: mongoose.Types.ObjectId[]; // IOT mean sensor modules attached
    totalAvailableMachine?: number;
    totalAvailableIOT?: number;
  };
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
  }; // @Jawed vy;  we need to make plane together
  isActive: boolean;
  usages: TUses;
  expDate: Date;
  price: TPurchasedPrice;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import { TCard } from '../common/common.interface';

export type TWallet = {
  // save(): unknown;
  // paymentMethodIds: any;
  ownerType:
    | 'user'
    | 'serviceProviderCompany'
    | 'serviceProviderBranch'
    | 'shop';
  user?: Types.ObjectId; // it user is ObjectId of the user model
  serviceProviderCompany?: Types.ObjectId; // objectId of ServiceProviderCompany model; used for company wallet
  serviceProviderBranch?: Types.ObjectId;
  shop?: Types.ObjectId;
  cards: { card: TCard; isDeleted: boolean }[];
  stripeCustomerId?: string;
  bankAccount?: Record<string, any>;
  balance: number; //
  point: number; //
  showaMB: number; // ?????????
};

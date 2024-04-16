import { Types } from 'mongoose';
export type TRole =
  // root user
  | 'showa-user'
  // showa user
  | 'showa-admin'
  | 'showa-sub-admin'
  //service provider user
  | 'service-provider-admin'
  | 'service-provider-sub-admin'
  | 'service-provider-engineer'
  | 'service-provider-branch-manager'
  | 'service-provider-support-stuff';

export type TUser = {
  uid: string;
  // uniqueNumberId?: string; // why we need this; cause we have already two different identifiers
  // fullName: firstName + " " + lastName // this fullName field will be virtual
  email: string;
  role: TRole;
  // canAccess?: ('xx' | 'yy' | 'zz')[]; // why we need this ?
  // stripeId: string;
  wallet?: Types.ObjectId; // it user is ObjectId of the Wallet model
  status: 'in-progress' | 'restricted' | 'approved';
  engineer?: Types.ObjectId; // objectId of Engineer model; if this user is engineer only when this field will be created
  showaUser?: Types.ObjectId;
  isDeleted: boolean; // by default false
};

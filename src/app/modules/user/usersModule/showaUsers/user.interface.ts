import { Types } from 'mongoose';
import { TAddress } from '../../../common/common.interface';
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

export type TLanguage = {
  katakana?: { name: { firstName: string; lastName: string } };
  korean?: { name: { firstName: string; lastName: string } };
};
export type TUser = {
  uid: string;
  // uniqueNumberId?: string; // why we need this; cause we have already two different identifiers
  name: { firstName: string; lastName: string };
  language?: TLanguage;
  // fullName: firstName + " " + lastName // this fullName field will be virtual
  email: string;

  phone?: string;

  occupation?: string;

  dateOfBirth: Date;
  gender: 'male' | 'female' | 'prefer-not-answer';

  photoUrl?: string;

  role: TRole;

  // canAccess?: ('xx' | 'yy' | 'zz')[]; // why we need this ?
  addresses?: { isDeleted: boolean; address: TAddress }[];
  // stripeId: string;
  wallet?: Types.ObjectId; // it user is ObjectId of the Wallet model
  status: 'in-progress' | 'restricted' | 'approved';

  isDeleted: boolean; // by default false
  engineer?: Types.ObjectId; // objectId of Engineer model; if this user is engineer only when this field will be created
};

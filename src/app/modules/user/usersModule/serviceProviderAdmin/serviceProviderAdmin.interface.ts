import { Types } from 'mongoose';

export type TServiceProviderAdmin = {
  user: Types.ObjectId;
  name: { firstName: string; lastName: string };

  // language?: TLanguage;
  // // fullName: firstName + " " + lastName // this fullName field will be virtual
  // phone: string;
  // occupation?: string;
  // dateOfBirth: Date;
  // gender: 'male' | 'female' | 'prefer-not-answer';
  // photoUrl?: string;
  // // canAccess?: ('xx' | 'yy' | 'zz')[]; // why we need this ?
  // addresses?: { isDeleted: boolean; address: TAddress }[];

  isDeleted: boolean; // by default false
};

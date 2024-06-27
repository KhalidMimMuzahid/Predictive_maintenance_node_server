import { Types } from 'mongoose';
import { TIsDeleted } from '../../../common/common.interface';

export type TServiceProviderAdmin = {
  user: Types.ObjectId;
  name: { firstName: string; lastName: string };
  photoUrl?: string;
  serviceProviderCompany: Types.ObjectId;
  shop?: Types.ObjectId;
  // language?: TLanguage;
  // // fullName: firstName + " " + lastName // this fullName field will be virtual
  // phone: string;
  // occupation?: string;
  // dateOfBirth: Date;
  // gender: 'male' | 'female' | 'prefer-not-answer';
  // photoUrl?: string;
  // // canAccess?: ('xx' | 'yy' | 'zz')[]; // why we need this ?
  // addresses?: { isDeleted: boolean; address: TAddress }[];

  isDeleted: TIsDeleted;
};

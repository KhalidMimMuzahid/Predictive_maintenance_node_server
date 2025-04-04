import { Types } from 'mongoose';
import { TAddress, TIsDeleted } from '../../../common/common.interface';

export type TLanguage = {
  katakana?: { name: { firstName: string; lastName: string } };
  kanji?: { name: { firstName: string; lastName: string } };
};
export type TName = { firstName: string; lastName: string };
export type TShowaUser = {
  user: Types.ObjectId;
  name: TName;
  language?: TLanguage;
  // fullName: firstName + " " + lastName // this fullName field will be virtual
  // phone: string;
  occupation?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'prefer-not-answer';
  photoUrl?: string;
  coverPhotoUrl?: string;
  // canAccess?: ('xx' | 'yy' | 'zz')[]; // why we need this ?
  addresses?: { isDeleted: boolean; address: TAddress }[];
  isDeleted: TIsDeleted;
};

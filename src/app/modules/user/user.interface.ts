/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';
import { TIsDeleted } from '../common/common.interface';
export type TRole =
  // root user
  | 'showaUser'
  // showa user
  | 'showaAdmin'
  | 'showaSubAdmin'
  //service provider user
  | 'serviceProviderAdmin'
  | 'serviceProviderSubAdmin'
  | 'serviceProviderEngineer'
  | 'serviceProviderBranchManager'
  | 'serviceProviderSupportStuff';

export type TUser = {
  uid: string;
  // uniqueNumberId?: string; // why we need this; cause we have already two different identifiers
  // fullName: firstName + " " + lastName // this fullName field will be virtual
  email: string;
  role: TRole;
  // canAccess?: ('xx' | 'yy' | 'zz')[]; // why we need this ?
  // stripeId: string;
  wallet?: Types.ObjectId; // it user is ObjectId of the Wallet model
  status: 'in-progress' | 'approved' | 'suspended';

  showaUser?: Types.ObjectId;
  serviceProviderAdmin?: Types.ObjectId;
  serviceProviderBranchManager?: Types.ObjectId;
  serviceProviderEngineer?: Types.ObjectId; // objectId of ServiceProviderEngineer model; if this user is engineer only when this field will be created
  // add more role
  isDeleted: TIsDeleted;
};

export interface UserModel extends Model<TUser> {
  isUidExists(uid: string): Promise<TUser | null>;
  isEmailExists(email: string): Promise<TUser | null>;
}






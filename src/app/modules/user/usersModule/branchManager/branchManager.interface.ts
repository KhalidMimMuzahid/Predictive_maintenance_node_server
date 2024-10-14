import { Types } from 'mongoose';
import { TAddress, TIsDeleted } from '../../../common/common.interface';

export type TName = { firstName: string; lastName: string };
export type TCurrentStateForBranchManager = {
  status: 'in-progress' | 'approved' | 'suspended';
  designation: 'Branch Manager';
  serviceProviderCompany: Types.ObjectId; // objectId of the ServiceProviderCompany ;
  serviceProviderBranch?: Types.ObjectId; // objectId of the ServiceProviderBranch model; if this field is missing means this engineer is not assigned to any branches
  joiningDate?: Date;
};
export type TServiceProviderBranchManager = {
  user: Types.ObjectId; // objectId of the user model

  name: TName;
  photoUrl?: string;
  coverPhotoUrl?: string;
  nid?: {
    frontPhotoUrl: string;
    backPhotoUrl: string;
  };
  currentState: TCurrentStateForBranchManager;
  isDeleted: TIsDeleted;
  occupation?: string;
  dateOfBirth: Date;
  addresses?: { isDeleted: boolean; address: TAddress }[];
  // nid: {
  //   frontPhotoUrl: string;
  //   backPhotoUrl: string;
  // };
  // history: {
  //   designation: string;
  //   company: string; // objectId of the ServiceProviderCompany
  //   branch: string; // objectId of the ServiceProviderBranch model
  //   joiningDate: Date;
  //   endingDate: Date;
  // }[];
};

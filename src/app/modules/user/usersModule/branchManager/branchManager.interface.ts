import { Types } from 'mongoose';
import { TIsDeleted } from '../../../common/common.interface';

export type TCurrentStateForBranchManager = {
  status: 'in-progress' | 'approved' | 'suspended';
  designation: 'Branch Manager';
  serviceProviderCompany: Types.ObjectId; // objectId of the ServiceProviderCompany ;
  serviceProviderBranch?: Types.ObjectId; // objectId of the ServiceProviderBranch model; if this field is missing means this engineer is not assigned to any branches
  joiningDate?: Date;
};
export type TServiceProviderBranchManager = {
  user: Types.ObjectId; // objectId of the user model

  name: { firstName: string; lastName: string };

  currentState: TCurrentStateForBranchManager;
  isDeleted: TIsDeleted;

  // history: {
  //   designation: string;
  //   company: string; // objectId of the ServiceProviderCompany
  //   branch: string; // objectId of the ServiceProviderBranch model
  //   joiningDate: Date;
  //   endingDate: Date;
  // }[];
};

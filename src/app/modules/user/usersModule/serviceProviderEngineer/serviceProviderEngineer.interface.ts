import { Types } from 'mongoose';
import { TAddress, TIsDeleted } from '../../../common/common.interface';

export type TCurrentStateForEngineer = {
  status: 'in-progress' | 'approved' | 'suspended';
  designation: 'Engineer';
  serviceProviderCompany: Types.ObjectId; // objectId of the ServiceProviderCompany ;
  serviceProviderBranch?: Types.ObjectId; // objectId of the ServiceProviderBranch model; if this field is missing means this engineer is not assigned to any branches
  joiningDate?: Date;
};
export type TName = { firstName: string; lastName: string };
export type TServiceProviderEngineer = {
  user: Types.ObjectId; // objectId of the user model

  name: TName;
  photoUrl?: string;
  coverPhotoUrl?: string;
  currentState: TCurrentStateForEngineer;
  isDeleted: TIsDeleted;
  occupation?: string;
  dateOfBirth: Date;
  addresses?: { isDeleted: boolean; address: TAddress }[];
  // ratings: {
  //   rate: number; // 0 to 5
  //   feedback: {
  //     comment: string;
  //     rate: number;
  //     user: Types.ObjectId; // objectId of the User
  //   }[];
  // };
  // history: {
  //   designation: string;
  //   company: string; // objectId of the ServiceProviderCompany
  //   branch: string; // objectId of the ServiceProviderBranch model
  //   joiningDate: Date;
  //   endingDate: Date;
  // }[];
};

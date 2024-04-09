import { Types } from 'mongoose';

export type TEngineer = {
  user: Types.ObjectId; // objectId of the user model
  current: {
    designation: string;
    company: Types.ObjectId; // objectId of the ServiceProviderCompany
    branch: Types.ObjectId; // objectId of the ServiceProviderBranch model
    joiningDate: Date;
  };
  ratings: {
    rate: number; // 0 to 5
    feedback: {
      comment: string;
      rate: number;
      user: Types.ObjectId; // objectId of the User
    }[];
  };
  history: {
    designation: string;
    company: string; // objectId of the ServiceProviderCompany
    branch: string; // objectId of the ServiceProviderBranch model
    joiningDate: Date;
    endingDate: Date;
  }[];
};

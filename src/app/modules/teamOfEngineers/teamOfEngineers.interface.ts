import { Types } from 'mongoose';
import { TIsDeleted } from '../common/common.interface';

export type TTeamOfEngineers = {
  teamName: string;
  serviceProviderCompany: Types.ObjectId; // objectId of ServiceProviderCompany model
  serviceProviderBranch: Types.ObjectId; // objectId of ServiceProviderBranch model
  createdBy: Types.ObjectId; // objectId of ServiceProviderBranchManager mode
  members: {
    isDeleted: boolean;
    member: Types.ObjectId; // objectId of ServiceProviderEngineer model
  }[];
  isDeleted: TIsDeleted;
};

import { Types } from 'mongoose';

export type TDeleteUser = {
  emailOrPhone: string;
};

export type TFeedback = {
  user: Types.ObjectId;
  isReviewed: boolean;
  title: string;
  photos?: {
    photoUrl: string;
    title?: string;
  }[];
};

export type TServiceProviderAdmin = {
  email: string;
  phone: string;
  companyName: string;
};
export type TShowaUser = {
  email: string;
  phone: string;
  name: { firstName: string; lastName: string };
};
export type TServiceProviderEngineer = {
  serviceProviderBranch?: string; // objectId of serviceProviderBranch
  email: string;
  phone: string;
  name: { firstName: string; lastName: string };
};

export type TServiceProviderBranchManager = {
  serviceProviderCompany?: string; // objectId of serviceProviderCompany
  email: string;
  phone: string;
  name: { firstName: string; lastName: string };
};

// => add engineers
// => add branch manager
// => add sub-admin
export type TInviteMember = {
  type:
    | 'serviceProviderAdmin'
    | 'showaUser'
    | 'serviceProviderEngineer'
    | 'serviceProviderBranchManager';
  // | 'serviceProviderSubAdmin';
  serviceProviderAdmin?: TServiceProviderAdmin;
  showaUser?: TShowaUser;
  serviceProviderEngineer?: TServiceProviderEngineer;
  serviceProviderBranchManager?: TServiceProviderBranchManager;
};
export type TExtraData = {
  type: 'deleteUser' | 'feedback' | 'inviteMember' | 'more';
  deleteUser: TDeleteUser;
  //   more?: {
  //     //
  //   };
  feedback?: TFeedback;
  inviteMember?: TInviteMember;
};

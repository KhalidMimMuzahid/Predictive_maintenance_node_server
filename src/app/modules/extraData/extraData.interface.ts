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
export type TInviteMember = {
  type: 'serviceProviderAdmin' | 'showaUser';
  serviceProviderAdmin?: TServiceProviderAdmin;
  showaUser?: TShowaUser;
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

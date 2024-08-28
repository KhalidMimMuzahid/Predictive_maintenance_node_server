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
export type TExtraData = {
  type: 'deleteUser' | 'feedback' | 'more';
  deleteUser: TDeleteUser;
  //   more?: {
  //     //
  //   };
  feedback?: TFeedback;
};

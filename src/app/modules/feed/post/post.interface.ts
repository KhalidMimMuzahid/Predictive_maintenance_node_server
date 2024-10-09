import mongoose from 'mongoose';

export type TUserPost = {
  title: string;
  files: {
    fileUrl: string;
    fileName: string;
    extension: string;
  }[];
};

export type TAdvertisement = {
  title: string;
  subtitle: string;
  description: string;
  scheduledDate: {
    startDate?: Date;
    endDate?: Date;
  };
  files: {
    fileUrl: string;
    fileName: string;
    extension: string;
  }[];
};
export type TSharingStatus = {
  isShared: boolean;
  post: mongoose.Types.ObjectId; // object id of another post
};

export type TReplay = {
  user: mongoose.Types.ObjectId;
  comment: string;
};
export type TPost = {
  location: string;
  viewPrivacy: 'public' | 'friends' | 'only-me' | 'specific-friends';
  commentPrivacy: 'public' | 'friends' | 'only-me' | 'specific-friends';
  user: mongoose.Types.ObjectId;
  isSponsored: boolean;
  isHidden: boolean;

  sharingStatus: TSharingStatus;
  // following: mongoose.Types.ObjectId;
  // followers: mongoose.Types.ObjectId;
  type: 'userPost' | 'advertisement' | 'shared';
  userPost: TUserPost;
  advertisement: TAdvertisement;
  likes: mongoose.Types.ObjectId[];
  comments: {
    user: mongoose.Types.ObjectId;
    comment: string;
    replays: TReplay[];
  }[];
  shares: mongoose.Types.ObjectId[]; // post after sharing

  seenBy: mongoose.Types.ObjectId[];
};

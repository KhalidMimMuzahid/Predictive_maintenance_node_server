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

export type TPost = {
  location: string;
  viewPrivacy: 'public' | 'friends' | 'only-me' | 'specific-friends';
  commentPrivacy: 'public' | 'friends' | 'only-me' | 'specific-friends';
  user: mongoose.Types.ObjectId;
  isSponsored: boolean;

  sharingStatus: {
    isShared: boolean;
    posts: mongoose.Types.ObjectId[]; // object id of another post
  };
  // following: mongoose.Types.ObjectId;
  // followers: mongoose.Types.ObjectId;
  type: 'userPost' | 'advertisement';
  userPost: TUserPost;
  advertisement: TAdvertisement;
  likes: mongoose.Types.ObjectId[];
  comments: {
    user: mongoose.Types.ObjectId;
    comment: string;
    replays: {
      user: mongoose.Types.ObjectId;
      comment: string;
    }[];
  }[];
  shares: {
    post: mongoose.Types.ObjectId; // post after sharing
  }[];

  seenBy: {
    user: mongoose.Types.ObjectId;
  }[];
};

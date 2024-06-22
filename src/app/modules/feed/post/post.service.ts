import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { TAuth } from '../../../interface/error';
import { TPost, TSharingStatus } from './post.interface';
import Post from './post.model';
import mongoose from 'mongoose';

const createPost = async ({
  postData,
  auth,
}: {
  postData: Partial<TPost>;

  auth: TAuth;
}) => {
  //   console.log(postData);

  //   postData.userPost = undefined;
  //   postData.advertisement = undefined;
  if (!postData[`${postData?.type}`]) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `must have ${postData?.type} object`,
    );
  }
  if (postData?.type === 'userPost') {
    postData.advertisement = undefined;
  } else if (postData?.type === 'advertisement') {
    postData.userPost = undefined;

    postData.advertisement.scheduledDate = {
      startDate: isNaN(
        new Date(
          postData.advertisement.scheduledDate?.startDate,
        ) as unknown as number,
      )
        ? undefined
        : new Date(postData.advertisement.scheduledDate?.startDate),
      endDate: isNaN(
        new Date(
          postData.advertisement.scheduledDate?.endDate,
        ) as unknown as number,
      )
        ? undefined
        : new Date(postData.advertisement.scheduledDate?.endDate),
    };
  }
  postData.user = auth._id;
  postData.likes = [];
  postData.comments = [];
  postData.shares = [];
  postData.seenBy = [];

  // userPost or advertisement

  const createdPostData = await Post.create(postData);
  return createdPostData;
};
const sharePost = async ({
  postData,
  post,
  auth,
}: {
  postData: Partial<TPost>;
  post: string;
  auth: TAuth;
}) => {
  //   console.log(postData);
  const originalPost = await Post.findById(post).select(
    'viewPrivacy sharingStatus shares',
  );

  console.log(originalPost);
  if (!originalPost) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `no post found with the post you provided`,
    );
  }
  if (!originalPost?.sharingStatus?.isShared) {
    postData.type = 'shared';
    postData.user = auth._id;
    postData.likes = [];
    postData.comments = [];
    postData.shares = [];
    postData.seenBy = [];
    const sharingStatus: TSharingStatus = {
      isShared: true,
      post: originalPost?._id,
    };

    postData.sharingStatus = sharingStatus;
  } else {
    // do it for shared post
  }
  //   postData.userPost = undefined;
  //   postData.advertisement = undefined;
  // if (!postData[`${postData?.type}`]) {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     `must have ${postData?.type} object`,
  //   );
  // }

  // if (postData?.type === 'userPost') {
  //   postData.advertisement = undefined;
  // } else if (postData?.type === 'advertisement') {
  //   postData.userPost = undefined;

  //   postData.advertisement.scheduledDate = {
  //     startDate: isNaN(
  //       new Date(
  //         postData.advertisement.scheduledDate?.startDate,
  //       ) as unknown as number,
  //     )
  //       ? undefined
  //       : new Date(postData.advertisement.scheduledDate?.startDate),
  //     endDate: isNaN(
  //       new Date(
  //         postData.advertisement.scheduledDate?.endDate,
  //       ) as unknown as number,
  //     )
  //       ? undefined
  //       : new Date(postData.advertisement.scheduledDate?.endDate),
  //   };
  // }
  // postData.user = auth._id;
  // postData.likes = [];
  // postData.comments = [];
  // postData.shares = [];
  // postData.seenBy = [];

  // userPost or advertisement

  const sharedPostData = await Post.create(postData);
  return sharedPostData;
};
const getPostsForMyFeed = async ({
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  user,
}: {
  user: mongoose.Types.ObjectId;
}) => {
  const result = await Post.find({});
  return result;
};
export const postServices = {
  createPost,
  sharePost,
  getPostsForMyFeed,
};

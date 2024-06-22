import { RequestHandler } from 'express';
import catchAsync from '../../../utils/catchAsync';
import { TAuth } from '../../../interface/error';
import { checkUserAccessApi } from '../../../utils/checkUserAccessApi';
import sendResponse from '../../../utils/sendResponse';
import httpStatus from 'http-status';
import { TPost } from './post.interface';
import { postServices } from './post.service';
import AppError from '../../../errors/AppError';

const createPost: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });
  const postData = req?.body as Partial<TPost>;

  const results = await postServices.createPost({
    postData,
    auth,
  });

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'post has been created successfully',
    data: results,
  });
});

const sharePost: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const post = req?.query?.post as string;
  // we are checking the permission of this api

  if (!post) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `post is required to share a post`,
    );
  }
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });

  const postData = req?.body as Partial<TPost>;

  const results = await postServices.sharePost({
    postData,
    post,
    auth,
  });

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'post has been shared successfully',
    data: results,
  });
});
const getPostsForMyFeed: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });

  const results = await postServices.getPostsForMyFeed({
    user: auth?._id,
  });

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'posts have been retrieved successfully',
    data: results,
  });
});
export const postController = {
  createPost,
  sharePost,
  getPostsForMyFeed,
};

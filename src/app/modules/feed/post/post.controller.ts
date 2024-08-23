import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { TAuth } from '../../../interface/error';
import catchAsync from '../../../utils/catchAsync';
import { checkUserAccessApi } from '../../../utils/checkUserAccessApi';
import sendResponse from '../../../utils/sendResponse';
import { TPost, TReplay } from './post.interface';
import { postServices } from './post.service';

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

const likePost: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const post = req?.query?.post as string;
  // we are checking the permission of this api

  if (!post) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `post is required to like a post`,
    );
  }
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });

  const results = await postServices.likePost({
    post,
    auth,
  });

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'post has been liked successfully',
    data: results,
  });
});

const unlikePost: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const post = req?.query?.post as string;
  // we are checking the permission of this api

  if (!post) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `post is required to unlike a post`,
    );
  }
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });

  const results = await postServices.unlikePost({
    post,
    auth,
  });

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'post has been un-liked successfully',
    data: results,
  });
});
const commentPost: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const post = req?.query?.post as string;
  // we are checking the permission of this api

  if (!post) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `post is required to comment a post`,
    );
  }
  const comment = req?.body?.comment as string;
  if (!comment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `comment is required to comment a post`,
    );
  }
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });

  const results = await postServices.commentPost({
    post,
    comment,
    auth,
  });

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'post has been commented successfully',
    data: results,
  });
});

const removeComment: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const post = req?.query?.post as string;
  const comment = req?.query?.comment as string;
  // we are checking the permission of this api .

  if (!post || !comment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `post and comment are required to remove comment`,
    );
  }

  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });

  const results = await postServices.removeComment({
    post,
    comment,
    // auth,
  });

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'post has been commented successfully',
    data: results,
  });
});
const addReplayIntoComment: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  // we are checking the permission of this api .
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });

  const post = req?.query?.post as string;
  const comment = req?.query?.comment as string;

  if (!post || !comment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `post and comment are required to add replay into comment`,
    );
  }

  const replay = req?.body?.replay as string;
  if (!replay) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `replay is required to replay into a comment`,
    );
  }

  const replayData: TReplay = {
    comment: replay,
    user: auth?._id,
  };

  const result = await postServices.addReplayIntoComment({
    post,
    comment,
    replayData,
  });

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'post has been commented successfully',
    data: result,
  });
});

const removeReplayFromComment: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  // we are checking the permission of this api .
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });

  const post = req?.query?.post as string;
  const comment = req?.query?.comment as string;
  const replay = req?.query?.replay as string;

  if (!post || !comment || !replay) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `post, comment and replay are required to remove comment`,
    );
  }

  const result = await postServices.removeReplayFromComment({
    post,
    comment,
    replay,
  });

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'replay has been remove from comment successfully',
    data: result,
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

const getAllLikesByPost: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });
  const post = req?.query?.post as string;
  if (!post) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `post is required to get all likes`,
    );
  }
  const results = await postServices.getAllLikesByPost(post);

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'post likes has retrieved successfully',
    data: results,
  });
});

const getAllCommentsByPost: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });
  const post = req?.query?.post as string;
  if (!post) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `post is required to get all likes`,
    );
  }
  const results = await postServices.getAllCommentsByPost(post);

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'post comments has retrieved successfully',
    data: results,
  });
});

const getAllSharesByPost: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });
  const post = req?.query?.post as string;
  if (!post) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `post is required to get all shares`,
    );
  }
  const results = await postServices.getAllSharesByPost(post);

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'post shares has retrieved successfully',
    data: results,
  });
});
const getAllReplaysByComment: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });
  const post = req?.query?.post as string;
  const comment = req?.query?.comment as string;

  if (!comment || !post) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `post & comment is required to get replays`,
    );
  }
  const results = await postServices.getAllReplaysByComment({ post, comment });

  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'comment replays have retrieved successfully',
    data: results,
  });
});

export const postController = {
  createPost,
  sharePost,
  likePost,
  unlikePost,
  commentPost,
  removeComment,

  addReplayIntoComment,
  removeReplayFromComment,
  getPostsForMyFeed,
  getAllLikesByPost,
  getAllCommentsByPost,
  getAllSharesByPost,
  getAllReplaysByComment,
};

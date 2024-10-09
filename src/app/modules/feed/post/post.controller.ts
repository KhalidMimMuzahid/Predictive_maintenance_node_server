import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { TAuth } from '../../../interface/error';
import catchAsync from '../../../utils/catchAsync';
import { checkUserAccessApi } from '../../../utils/checkUserAccessApi';
import sendResponse from '../../../utils/sendResponse';
import { searchTypeArray } from '../../common/common.const';
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

const getPostByPostId: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });

  const postId = req?.query?.postId as string;

  if (!postId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'post id is required to get the post',
    );
  }

  const result = await postServices.getPostByPostId(postId);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post retrieved successfully',
    data: result,
  });
});

const deletePost: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });

  const postId = req?.query?.postId as string;

  if (!postId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'postId is required to delete the post',
    );
  }

  const result = await postServices.deletePost({
    postId,
    auth,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post deleted successfully',
    data: result,
  });
});
const getAllPostsByUser: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  checkUserAccessApi({ auth, accessUsers: 'all' });

  const userId = req?.query?.userId as string;

  if (!userId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User ID is required');
  }

  const postsData = await postServices.getAllPostsByUser({
    userId,
    isMyPost: auth._id?.toString() === userId,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Posts retrieved successfully for user',
    data: postsData,
  });
});

const getRecentSearchForCustomerApp: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    checkUserAccessApi({ auth, accessUsers: 'all' });
    const { searchQuery, action } = req.query as {
      searchQuery: string;

      action: 'searchPosts' | 'searchPeople' | 'maintenance';
    };

    if (!searchTypeArray.some((each) => each === action)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `action must be any of ${searchTypeArray.reduce((total, current) => {
          total = total + `${current}, `;
          return total;
        }, '')}`,
      );
    }

    const combinedData = await postServices.getRecentSearchForCustomerApp({
      searchQuery: searchQuery as string,
      action: action as 'posts' | 'people' | 'maintenance',
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `${action} retrieved successfully`,
      data: combinedData,
    });
  },
);

const editPost: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  checkUserAccessApi({
    auth,
    accessUsers: 'all',
  });

  const postId = req?.query?.postId as string;
  const postData = req?.body as Partial<TPost>;

  if (!postId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Post ID is required to edit the post',
    );
  }

  if (!Object.keys(postData).length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No post data provided for the update',
    );
  }

  // if (!postData) {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     'No post data provided for the update',
  //   );
  // }

  const updatedPost = await postServices.editPost({
    postId,
    postData,
    auth,
  });

  if (!updatedPost) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post has been updated successfully',
    data: updatedPost,
  });
});

const hidePost: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req.headers.auth as unknown as TAuth;
  const postId = req.query.postId as string;

  if (!postId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Post ID is required to hide the post',
    );
  }

  const result = await postServices.hidePost({
    postId,
    auth,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,

    data: result,
  });
});

const getRecentSearchForSuperAdminWeb: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    checkUserAccessApi({ auth, accessUsers: 'all' });
    const { searchQuery, action } = req.query as {
      searchQuery: string;

      action: 'searchPosts' | 'searchPeople' | 'maintenance';
    };

    if (!searchTypeArray.some((each) => each === action)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `action must be any of ${searchTypeArray.reduce((total, current) => {
          total = total + `${current}, `;
          return total;
        }, '')}`,
      );
    }

    const combinedData = await postServices.getRecentSearchForSuperAdminWeb({
      searchQuery: searchQuery as string,
      action: action as 'posts' | 'people' | 'maintenance',
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `${action} retrieved successfully`,
      data: combinedData,
    });
  },
);

export const postController = {
  createPost, ///customer web app->feed->create post
  sharePost, //customer app->feed
  likePost, //customer app->feed
  unlikePost, //customer app->feed
  commentPost, //customer app->feed
  removeComment, //customer app->feed
  addReplayIntoComment, //customer app->feed
  removeReplayFromComment, //customer app->feed
  getPostsForMyFeed, //customer app->feed
  getAllLikesByPost, //customer app->feed
  getAllCommentsByPost, //customer app->feed
  getAllSharesByPost, //customer app->feed
  getAllReplaysByComment, //customer app->feed
  getPostByPostId, //customer app->feed
  deletePost, //customer app->feed->more settings
  getAllPostsByUser, //customer app->feed
  getRecentSearchForCustomerApp, //(search post,people and maintanence) customer app->feed->search->recent search
  editPost, //customer app->feed->more settings
  hidePost, //customer app->feed
  getRecentSearchForSuperAdminWeb, //Showa super admin web->feed->search result
};

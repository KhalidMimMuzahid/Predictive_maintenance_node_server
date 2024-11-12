/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import AppError from '../../../errors/AppError';
import { TAuth } from '../../../interface/error';
import { TSearchType } from '../../common/common.interface';
import Order from '../../marketplace/order/order.model';
import { ServiceProviderCompany } from '../../serviceProviderCompany/serviceProviderCompany.model';
import { User } from '../../user/user.model';
import { TPost, TReplay, TSharingStatus } from './post.interface';
import Post from './post.model';

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
    const originalNestedPost = await Post.findById(
      originalPost?.sharingStatus?.post?.toString(),
    ).select('viewPrivacy sharingStatus shares');

    postData.type = 'shared';
    postData.user = auth._id;
    postData.likes = [];
    postData.comments = [];
    postData.shares = [];
    postData.seenBy = [];
    const sharingStatus: TSharingStatus = {
      isShared: true,
      post: originalNestedPost?._id,
    };

    postData.sharingStatus = sharingStatus;
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const sharedPostDataArray = await Post.create([postData], { session });
    if (!sharedPostDataArray?.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `something went wrong, please try again`,
      );
    }
    const sharedPostData = sharedPostDataArray[0];
    originalPost.shares.push(sharedPostData?._id);
    const updatedOriginalPost = await originalPost.save({ session });

    if (!updatedOriginalPost) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `something went wrong, please try again`,
      );
    }
    if (originalPost?.sharingStatus?.isShared) {
      // do it for shared post
      const updatedOriginalNestedPost = await Post.findByIdAndUpdate(
        originalPost?.sharingStatus?.post?.toString(),
        { $push: { shares: sharedPostData?._id } },
      );
      if (!updatedOriginalNestedPost) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `something went wrong, please try again`,
        );
      }
    }

    await session.commitTransaction();
    await session.endSession();
    return true;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const likePost = async ({ post, auth }: { post: string; auth: TAuth }) => {
  // const updatedPost =
  await Post.findByIdAndUpdate(post, {
    $addToSet: { likes: auth?._id },
  });

  // console.log(updatedPost);

  return null;
};
const unlikePost = async ({ post, auth }: { post: string; auth: TAuth }) => {
  // const updatedPost =
  await Post.findByIdAndUpdate(post, {
    $pull: { likes: auth?._id },
  });

  // console.log(updatedPost);

  return null;
};

const commentPost = async ({
  post,
  comment,
  auth,
}: {
  post: string;
  comment: string;
  auth: TAuth;
}) => {
  // const updatedPost =
  await Post.findByIdAndUpdate(post, {
    $push: {
      comments: {
        user: auth?._id,
        comment,
        replays: [],
      },
    },
  });

  // console.log(updatedPost);

  return null;
};

const removeComment = async ({
  post,
  comment, // auth,
}: {
  post: string;
  comment: string;
  // auth: TAuth;
}) => {
  // const updatedPost =
  await Post.findByIdAndUpdate(post, {
    $pull: {
      comments: {
        _id: new mongoose.Types.ObjectId(comment),
      },
    },
  });

  // console.log(updatedPost);

  return null;
};

const addReplayIntoComment = async ({
  post,
  comment,
  replayData,
}: {
  post: string;
  comment: string;
  replayData: TReplay;
}) => {
  // const post = await Post.findOneAndUpdate(
  //   {
  //     _id: postId,
  //     'comments._id': commentId
  //   },
  //   {
  //     // Push the new reply to the replays array of the matched comment
  //     $push: { 'comments.$.replays': replyData }
  //   },
  //   { new: true } // Return the updated document
  // );

  // const updatedPost =
  await Post.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(post),
      'comments._id': new mongoose.Types.ObjectId(comment),
    },
    {
      $push: { 'comments.$.replays': replayData },
    },
  );

  // console.log(updatedPost);

  return null;
};

const removeReplayFromComment = async ({
  post,
  comment,
  replay,
}: {
  post: string;
  comment: string;
  replay: string;
}) => {
  // const updatedPost =
  await Post.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(post),
      'comments._id': new mongoose.Types.ObjectId(comment),
    },
    {
      $pull: {
        'comments.$.replays': { _id: new mongoose.Types.ObjectId(replay) },
      },
    },
  );

  // console.log(updatedPost);

  return null;
};
const getPostsForMyFeed = async ({
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  user,
}: {
  user: mongoose.Types.ObjectId;
}) => {
  const followingUsers = await User.findById(user).select('followings');
  if (!followingUsers?.followings?.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Please follow some users to get posts`,
    );
  }

  // const result = await Post.find({
  //   user: {
  //     $in: followingUsers?.followings,
  //   },
  // }).populate({
  //   path: 'user',
  //   select:
  //     'showaUser showaAdmin showaSubAdmin serviceProviderAdmin serviceProviderSubAdmin serviceProviderEngineer serviceProviderBranchManager',
  //   populate: [
  //     {
  //       path: 'showaUser',
  //       select: 'photoUrl name',

  //       options: { strictPopulate: false },
  //     },
  //     {
  //       path: 'showaAdmin',
  //       select: 'photoUrl name',
  //       options: { strictPopulate: false },
  //     },
  //     {
  //       path: 'showaSubAdmin',
  //       select: 'photoUrl name',
  //       options: { strictPopulate: false },
  //     },
  //     {
  //       path: 'serviceProviderAdmin',
  //       select: 'photoUrl name',
  //       options: { strictPopulate: false },
  //     },
  //     {
  //       path: 'serviceProviderSubAdmin',
  //       options: { strictPopulate: false },
  //     },
  //     {
  //       path: 'serviceProviderEngineer',
  //       select: 'photoUrl name',
  //       options: { strictPopulate: false },
  //     },
  //     {
  //       path: 'serviceProviderBranchManager',
  //       select: 'photoUrl name',
  //       options: { strictPopulate: false },
  //     },
  //   ],
  // });
  // create index for user field in mongodb
  const result = await Post.aggregate([
    {
      $match: {
        user: {
          $in: followingUsers?.followings,
        },
        // for testing we no need now this one, cause weed same post in multiple time for testing
        // seenBy: {
        //   $nin: [user],
        // },
      },
    },

    // { $sort: { age : -1 } },

    {
      $lookup: {
        from: 'users', // Name of the user collection
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $lookup: {
        from: 'showausers', // Name of the showaUser collection
        localField: 'user.showaUser',
        foreignField: '_id',
        as: 'user.showaUser',
      },
    },
    {
      $lookup: {
        from: 'showaadmins', // Name of the showaAdmin collection
        localField: 'user.showaAdmin',
        foreignField: '_id',
        as: 'user.showaAdmin',
      },
    },
    {
      $lookup: {
        from: 'showasubadmins', // Name of the showaSubAdmin collection
        localField: 'user.showaSubAdmin',
        foreignField: '_id',
        as: 'user.showaSubAdmin',
      },
    },
    {
      $lookup: {
        from: 'serviceprovideradmins', // Name of the serviceProviderAdmin collection
        localField: 'user.serviceProviderAdmin',
        foreignField: '_id',
        as: 'user.serviceProviderAdmin',
      },
    },
    {
      $lookup: {
        from: 'serviceprovidersubadmins', // Name of the serviceProviderSubAdmin collection
        localField: 'user.serviceProviderSubAdmin',
        foreignField: '_id',
        as: 'user.serviceProviderSubAdmin',
      },
    },
    {
      $lookup: {
        from: 'serviceproviderengineers', // Name of the serviceProviderEngineer collection
        localField: 'user.serviceProviderEngineer',
        foreignField: '_id',
        as: 'user.serviceProviderEngineer',
      },
    },
    {
      $lookup: {
        from: 'serviceproviderbranchmanagers', // Name of the serviceProviderBranchManager collection
        localField: 'user.serviceProviderBranchManager',
        foreignField: '_id',
        as: 'user.serviceProviderBranchManager',
      },
    },

    { $sort: { createdAt: -1 } },

    {
      $project: {
        _id: 1,
        // for user start
        'user._id': 1,
        'user.role': 1,
        'user.showaUser.photoUrl': 1,
        'user.showaUser.name': 1,
        'user.showaAdmin.photoUrl': 1,
        'user.showaAdmin.name': 1,
        'user.showaSubAdmin.photoUrl': 1,
        'user.showaSubAdmin.name': 1,
        'user.serviceProviderAdmin.photoUrl': 1,
        'user.serviceProviderAdmin.name': 1,
        'user.serviceProviderSubAdmin': 1,
        'user.serviceProviderEngineer.photoUrl': 1,
        'user.serviceProviderEngineer.name': 1,
        'user.serviceProviderBranchManager.photoUrl': 1,
        'user.serviceProviderBranchManager.name': 1,
        // for user ends
        location: 1,
        viewPrivacy: 1,
        commentPrivacy: 1,
        // user: 1,
        sharingStatus: 1,
        isSponsored: 1,
        type: 1,
        userPost: 1,
        advertisement: 1,
        createdAt: 1,
        // likes: 1,
        likeObject: {
          likesCount: { $size: '$likes' },
          likes: { $slice: ['$likes', -3] },
        },
        // comments: 1,
        commentObject: {
          commentsCount: { $size: '$comments' },
          comments: { $slice: ['$comments', -2] },
        },
        // shares: 1,
        shareObject: {
          sharesCount: { $size: '$shares' },
          shares: { $slice: ['$shares', -2] },
        },
        // seenBy: 1,
        seenByObject: {
          seenByCount: { $size: '$seenBy' },
          seenBy: { $slice: ['$seenBy', -3] },
        },
      },
    },
    {
      $project: {
        _id: 1,
        // for user start
        // user: 1,
        user: {
          _id: '$user._id',
          role: '$user.role',

          serviceProviderAdmin: {
            $arrayElemAt: ['$user.serviceProviderAdmin', 0],
          },
          showaUser: {
            $arrayElemAt: ['$user.showaUser', 0],
          },
          showaAdmin: {
            $arrayElemAt: ['$user.showaAdmin', 0],
          },
          showaSubAdmin: {
            $arrayElemAt: ['$user.showaSubAdmin', 0],
          },
          serviceProviderSubAdmin: {
            $arrayElemAt: ['$user.serviceProviderSubAdmin', 0],
          },
          serviceProviderEngineer: {
            $arrayElemAt: ['$user.serviceProviderEngineer', 0],
          },
          serviceProviderBranchManager: {
            $arrayElemAt: ['$user.serviceProviderBranchManager', 0],
          },
        },
        // for user ends
        createdAt: 1,
        location: 1,
        viewPrivacy: 1,
        commentPrivacy: 1,
        // user: 1,
        sharingStatus: 1,
        isSponsored: 1,
        type: 1,
        userPost: 1,
        advertisement: 1,
        // likes: 1,
        likeObject: 1,
        // comments: 1,
        commentObject: 1,
        // shares: 1,
        shareObject: 1,
        // seenBy: 1,
        seenByObject: 1,
      },
    },
  ]);
  await Post.updateMany(
    {
      _id: { $in: result?.map((each) => each?._id) },
    },
    {
      $addToSet: { seenBy: user },
    },
  );

  /* ------------------- ************ --------------------
  
  Here we have a user (_id of my own user)
  After getting my user data from mongodb we will get following list ;
  
  And We have multiple posts ; each post have its user and viewPrivacy fields; user will contain _id of user who create this post and viewPrivacy's value can have only 'public' for now
  
  step 1: first find your all following users list\
  step 2: find all those post, where post.user matches the in your following user list.
  
  where query must have those logic:
  step 3: additionally we need total comments count and list of last if 2 comments of each post.
           note that: we need last two comments
  step 5: additionally we need total likes count and list of last 3 likes and if this likes list have your own _id then i this likes list your _id must have include, it doesn't matter that you are the user who likes this post as a last three users or not
  step 6: additionally we need total shares count only
  ------------------- ************ -------------------- */
  // const result = await Post.find({});
  return result;
};

const getAllLikesByPost = async (post: string) => {
  const result = await Post.findById(post).select('likes');
  return result;
};

const getAllCommentsByPost = async (post: string) => {
  const result = await Post.findById(post).select('comments');
  return result;
};
const getAllSharesByPost = async (post: string) => {
  const result = await Post.findById(post).select('shares');
  return result;
};
const getAllReplaysByComment = async ({
  post,
  comment,
}: {
  post: string;
  comment: string;
}) => {
  const postData = await Post.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(post) } },
    { $unwind: '$comments' }, // Deconstruct the comments array
    { $match: { 'comments._id': new mongoose.Types.ObjectId(comment) } }, // Match the specific comment by its _id
    { $project: { _id: 0, replies: '$comments.replays' } }, // Project the replies array
  ]);

  return postData[0]?.replies;
};

const getPostByPostId = async (postId: string) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Invalid postId provided`);
  }

  const postData = await Post.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(postId) },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'showausers',
        localField: 'user.showaUser',
        foreignField: '_id',
        as: 'user.showaUser',
      },
    },
    {
      $lookup: {
        from: 'showaadmins',
        localField: 'user.showaAdmin',
        foreignField: '_id',
        as: 'user.showaAdmin',
      },
    },
    {
      $lookup: {
        from: 'showasubadmins',
        localField: 'user.showaSubAdmin',
        foreignField: '_id',
        as: 'user.showaSubAdmin',
      },
    },
    {
      $lookup: {
        from: 'serviceprovideradmins',
        localField: 'user.serviceProviderAdmin',
        foreignField: '_id',
        as: 'user.serviceProviderAdmin',
      },
    },
    {
      $lookup: {
        from: 'serviceprovidersubadmins',
        localField: 'user.serviceProviderSubAdmin',
        foreignField: '_id',
        as: 'user.serviceProviderSubAdmin',
      },
    },
    {
      $lookup: {
        from: 'serviceproviderengineers',
        localField: 'user.serviceProviderEngineer',
        foreignField: '_id',
        as: 'user.serviceProviderEngineer',
      },
    },
    {
      $lookup: {
        from: 'serviceproviderbranchmanagers',
        localField: 'user.serviceProviderBranchManager',
        foreignField: '_id',
        as: 'user.serviceProviderBranchManager',
      },
    },

    { $sort: { createdAt: -1 } },

    {
      $project: {
        _id: 1,
        location: 1,
        viewPrivacy: 1,
        commentPrivacy: 1,
        sharingStatus: 1,
        isSponsored: 1,
        type: 1,
        userPost: 1,
        advertisement: 1,
        createdAt: 1,
        likeObject: {
          likesCount: { $size: '$likes' },
          likes: { $slice: ['$likes', -3] },
        },
        commentObject: {
          commentsCount: { $size: '$comments' },
          comments: { $slice: ['$comments', -2] },
        },
        shareObject: {
          sharesCount: { $size: '$shares' },
          shares: { $slice: ['$shares', -2] },
        },
        seenByObject: {
          seenByCount: { $size: '$seenBy' },
          seenBy: { $slice: ['$seenBy', -3] },
        },
        user: {
          _id: 1,
          role: 1,
          showaUser: {
            $cond: {
              if: { $gt: [{ $size: '$user.showaUser' }, 0] },
              then: {
                name: { $arrayElemAt: ['$user.showaUser.name', 0] },
                photoUrl: { $arrayElemAt: ['$user.showaUser.photoUrl', 0] },
              },
              else: '$$REMOVE',
            },
          },
          showaAdmin: {
            $cond: {
              if: { $gt: [{ $size: '$user.showaAdmin' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$user.showaAdmin._id', 0] },
                user: { $arrayElemAt: ['$user.showaAdmin.user', 0] },
                name: { $arrayElemAt: ['$user.showaAdmin.name', 0] },
                photoUrl: { $arrayElemAt: ['$user.showaAdmin.photoUrl', 0] },
              },
              else: '$$REMOVE',
            },
          },
          showaSubAdmin: {
            $cond: {
              if: { $gt: [{ $size: '$user.showaSubAdmin' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$user.showaSubAdmin._id', 0] },
                user: { $arrayElemAt: ['$user.showaSubAdmin.user', 0] },
                name: { $arrayElemAt: ['$user.showaSubAdmin.name', 0] },
                photoUrl: { $arrayElemAt: ['$user.showaSubAdmin.photoUrl', 0] },
              },
              else: '$$REMOVE',
            },
          },
          serviceProviderAdmin: {
            $cond: {
              if: { $gt: [{ $size: '$user.serviceProviderAdmin' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$user.serviceProviderAdmin._id', 0] },
                user: { $arrayElemAt: ['$user.serviceProviderAdmin.user', 0] },
                name: {
                  $arrayElemAt: ['$user.serviceProviderAdmin.name', 0],
                },
                photoUrl: {
                  $arrayElemAt: ['$user.serviceProviderAdmin.photoUrl', 0],
                },
              },
              else: '$$REMOVE',
            },
          },
          serviceProviderSubAdmin: {
            $cond: {
              if: { $gt: [{ $size: '$user.serviceProviderSubAdmin' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$user.serviceProviderSubAdmin._id', 0] },
                user: {
                  $arrayElemAt: ['$user.serviceProviderSubAdmin.user', 0],
                },
                name: {
                  $arrayElemAt: ['$user.serviceProviderSubAdmin.name', 0],
                },
                photoUrl: {
                  $arrayElemAt: ['$user.serviceProviderSubAdmin.photoUrl', 0],
                },
              },
              else: '$$REMOVE',
            },
          },
          serviceProviderEngineer: {
            $cond: {
              if: { $gt: [{ $size: '$user.serviceProviderEngineer' }, 0] },
              then: {
                _id: {
                  $arrayElemAt: ['$user.serviceProviderEngineer._id', 0],
                },
                user: {
                  $arrayElemAt: ['$user.serviceProviderEngineer.user', 0],
                },
                name: {
                  $arrayElemAt: ['$user.serviceProviderEngineer.name', 0],
                },
                photoUrl: {
                  $arrayElemAt: ['$user.serviceProviderEngineer.photoUrl', 0],
                },
              },
              else: '$$REMOVE',
            },
          },
          serviceProviderBranchManager: {
            $cond: {
              if: { $gt: [{ $size: '$user.serviceProviderBranchManager' }, 0] },
              then: {
                _id: {
                  $arrayElemAt: ['$user.serviceProviderBranchManager._id', 0],
                },
                user: {
                  $arrayElemAt: ['$user.serviceProviderBranchManager.user', 0],
                },
                name: {
                  $arrayElemAt: ['$user.serviceProviderBranchManager.name', 0],
                },
                photoUrl: {
                  $arrayElemAt: [
                    '$user.serviceProviderBranchManager.photoUrl',
                    0,
                  ],
                },
              },
              else: '$$REMOVE',
            },
          },
        },
      },
    },
  ]);

  if (!postData || postData.length === 0) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `Post with id ${postId} not found`,
    );
  }

  return postData[0];
};

const deletePost = async ({
  postId,
  auth,
}: {
  postId: string;
  auth: TAuth;
}) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  // const user = await User.findById(auth._id);
  // if (!user) {
  //   throw new AppError(httpStatus.UNAUTHORIZED, 'User not authenticated');
  // }

  if (post.user.toString() !== auth._id.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You do not have permission to delete this post',
    );
  }

  await Post.findByIdAndDelete(postId);

  return;
};

const getAllPostsByUser = async ({
  userId,
  isMyPost,
}: {
  userId: string;
  isMyPost: boolean;
}) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid userId provided');
  }

  const userPost = isMyPost
    ? { user: new mongoose.Types.ObjectId(userId), isHidden: { $ne: true } }
    : {
        user: new mongoose.Types.ObjectId(userId),
        viewPrivacy: { $in: ['public', 'friends'] },
        isHidden: { $ne: true },
      };

  const postsData = await Post.aggregate([
    { $match: userPost },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $lookup: {
        from: 'showausers',
        localField: 'user.showaUser',
        foreignField: '_id',
        as: 'user.showaUser',
      },
    },
    {
      $lookup: {
        from: 'showaadmins',
        localField: 'user.showaAdmin',
        foreignField: '_id',
        as: 'user.showaAdmin',
      },
    },
    {
      $lookup: {
        from: 'showasubadmins',
        localField: 'user.showaSubAdmin',
        foreignField: '_id',
        as: 'user.showaSubAdmin',
      },
    },
    {
      $lookup: {
        from: 'serviceprovideradmins',
        localField: 'user.serviceProviderAdmin',
        foreignField: '_id',
        as: 'user.serviceProviderAdmin',
      },
    },
    {
      $lookup: {
        from: 'serviceprovidersubadmins',
        localField: 'user.serviceProviderSubAdmin',
        foreignField: '_id',
        as: 'user.serviceProviderSubAdmin',
      },
    },
    {
      $lookup: {
        from: 'serviceproviderengineers',
        localField: 'user.serviceProviderEngineer',
        foreignField: '_id',
        as: 'user.serviceProviderEngineer',
      },
    },
    {
      $lookup: {
        from: 'serviceproviderbranchmanagers',
        localField: 'user.serviceProviderBranchManager',
        foreignField: '_id',
        as: 'user.serviceProviderBranchManager',
      },
    },

    { $sort: { createdAt: -1 } },

    {
      $project: {
        _id: 1,
        location: 1,
        viewPrivacy: 1,
        commentPrivacy: 1,
        sharingStatus: 1,
        isSponsored: 1,
        type: 1,
        userPost: 1,
        advertisement: 1,
        createdAt: 1,
        likeObject: {
          likesCount: { $size: '$likes' },
          likes: { $slice: ['$likes', -3] },
        },
        commentObject: {
          commentsCount: { $size: '$comments' },
          comments: { $slice: ['$comments', -2] },
        },
        shareObject: {
          sharesCount: { $size: '$shares' },
          shares: { $slice: ['$shares', -2] },
        },
        seenByObject: {
          seenByCount: { $size: '$seenBy' },
          seenBy: { $slice: ['$seenBy', -3] },
        },
        user: {
          _id: 1,
          role: 1,
          showaUser: {
            $cond: {
              if: { $gt: [{ $size: '$user.showaUser' }, 0] },
              then: {
                name: { $arrayElemAt: ['$user.showaUser.name', 0] },
                photoUrl: { $arrayElemAt: ['$user.showaUser.photoUrl', 0] },
              },
              else: '$$REMOVE',
            },
          },
          showaAdmin: {
            $cond: {
              if: { $gt: [{ $size: '$user.showaAdmin' }, 0] },
              then: {
                name: { $arrayElemAt: ['$user.showaAdmin.name', 0] },
                photoUrl: { $arrayElemAt: ['$user.showaAdmin.photoUrl', 0] },
              },
              else: '$$REMOVE',
            },
          },
          showaSubAdmin: {
            $cond: {
              if: { $gt: [{ $size: '$user.showaSubAdmin' }, 0] },
              then: {
                name: { $arrayElemAt: ['$user.showaSubAdmin.name', 0] },
                photoUrl: { $arrayElemAt: ['$user.showaSubAdmin.photoUrl', 0] },
              },
              else: '$$REMOVE',
            },
          },
          serviceProviderAdmin: {
            $cond: {
              if: { $gt: [{ $size: '$user.serviceProviderAdmin' }, 0] },
              then: {
                name: { $arrayElemAt: ['$user.serviceProviderAdmin.name', 0] },
                photoUrl: {
                  $arrayElemAt: ['$user.serviceProviderAdmin.photoUrl', 0],
                },
              },
              else: '$$REMOVE',
            },
          },
          serviceProviderSubAdmin: {
            $cond: {
              if: { $gt: [{ $size: '$user.serviceProviderSubAdmin' }, 0] },
              then: {
                name: {
                  $arrayElemAt: ['$user.serviceProviderSubAdmin.name', 0],
                },
                photoUrl: {
                  $arrayElemAt: ['$user.serviceProviderSubAdmin.photoUrl', 0],
                },
              },
              else: '$$REMOVE',
            },
          },
          serviceProviderEngineer: {
            $cond: {
              if: { $gt: [{ $size: '$user.serviceProviderEngineer' }, 0] },
              then: {
                name: {
                  $arrayElemAt: ['$user.serviceProviderEngineer.name', 0],
                },
                photoUrl: {
                  $arrayElemAt: ['$user.serviceProviderEngineer.photoUrl', 0],
                },
              },
              else: '$$REMOVE',
            },
          },
          serviceProviderBranchManager: {
            $cond: {
              if: { $gt: [{ $size: '$user.serviceProviderBranchManager' }, 0] },
              then: {
                name: {
                  $arrayElemAt: ['$user.serviceProviderBranchManager.name', 0],
                },
                photoUrl: {
                  $arrayElemAt: [
                    '$user.serviceProviderBranchManager.photoUrl',
                    0,
                  ],
                },
              },
              else: '$$REMOVE',
            },
          },
        },
      },
    },
  ]);

  return postsData;
};

const getRecentSearchForCustomerApp = async ({
  searchQuery,
  action,
  user,
}: {
  searchQuery: string;
  action: TSearchType;
  user: Types.ObjectId;
}) => {
  if (searchQuery.length < 2) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Search query must contain at least 2 characters',
    );
  }

  let result = [];

  switch (action) {
    case 'posts':
      result = await Post.aggregate([
        {
          $match: {
            $or: [
              { 'userPost.title': { $regex: searchQuery, $options: 'i' } },
              { 'advertisement.title': { $regex: searchQuery, $options: 'i' } },
            ],
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
        {
          $lookup: {
            from: 'showausers',
            localField: 'user.showaUser',
            foreignField: '_id',
            as: 'user.showaUser',
          },
        },
        {
          $lookup: {
            from: 'showaadmins',
            localField: 'user.showaAdmin',
            foreignField: '_id',
            as: 'user.showaAdmin',
          },
        },
        {
          $lookup: {
            from: 'showasubadmins',
            localField: 'user.showaSubAdmin',
            foreignField: '_id',
            as: 'user.showaSubAdmin',
          },
        },
        {
          $lookup: {
            from: 'serviceprovideradmins',
            localField: 'user.serviceProviderAdmin',
            foreignField: '_id',
            as: 'user.serviceProviderAdmin',
          },
        },
        {
          $lookup: {
            from: 'serviceprovidersubadmins',
            localField: 'user.serviceProviderSubAdmin',
            foreignField: '_id',
            as: 'user.serviceProviderSubAdmin',
          },
        },
        {
          $lookup: {
            from: 'serviceproviderengineers',
            localField: 'user.serviceProviderEngineer',
            foreignField: '_id',
            as: 'user.serviceProviderEngineer',
          },
        },
        {
          $lookup: {
            from: 'serviceproviderbranchmanagers',
            localField: 'user.serviceProviderBranchManager',
            foreignField: '_id',
            as: 'user.serviceProviderBranchManager',
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $project: {
            _id: 1,
            'user._id': 1,
            'user.role': 1,
            'user.showaUser.photoUrl': 1,
            'user.showaUser.name': 1,
            'user.showaAdmin.photoUrl': 1,
            'user.showaAdmin.name': 1,
            'user.showaSubAdmin.photoUrl': 1,
            'user.showaSubAdmin.name': 1,
            'user.serviceProviderAdmin.photoUrl': 1,
            'user.serviceProviderAdmin.name': 1,
            'user.serviceProviderSubAdmin': 1,
            'user.serviceProviderEngineer.photoUrl': 1,
            'user.serviceProviderEngineer.name': 1,
            'user.serviceProviderBranchManager.photoUrl': 1,
            'user.serviceProviderBranchManager.name': 1,
            location: 1,
            viewPrivacy: 1,
            commentPrivacy: 1,
            sharingStatus: 1,
            isSponsored: 1,
            type: 1,
            userPost: 1,
            advertisement: 1,
            createdAt: 1,
            likeObject: {
              likesCount: { $size: '$likes' },
              likes: { $slice: ['$likes', -3] },
            },
            commentObject: {
              commentsCount: { $size: '$comments' },
              comments: { $slice: ['$comments', -2] },
            },
            shareObject: {
              sharesCount: { $size: '$shares' },
              shares: { $slice: ['$shares', -2] },
            },
            seenByObject: {
              seenByCount: { $size: '$seenBy' },
              seenBy: { $slice: ['$seenBy', -3] },
            },
          },
        },
        {
          $project: {
            _id: 1,
            user: {
              _id: '$user._id',
              role: '$user.role',
              serviceProviderAdmin: {
                $arrayElemAt: ['$user.serviceProviderAdmin', 0],
              },
              showaUser: { $arrayElemAt: ['$user.showaUser', 0] },
              showaAdmin: { $arrayElemAt: ['$user.showaAdmin', 0] },
              showaSubAdmin: { $arrayElemAt: ['$user.showaSubAdmin', 0] },
              serviceProviderSubAdmin: {
                $arrayElemAt: ['$user.serviceProviderSubAdmin', 0],
              },
              serviceProviderEngineer: {
                $arrayElemAt: ['$user.serviceProviderEngineer', 0],
              },
              serviceProviderBranchManager: {
                $arrayElemAt: ['$user.serviceProviderBranchManager', 0],
              },
            },
            createdAt: 1,
            location: 1,
            viewPrivacy: 1,
            commentPrivacy: 1,
            sharingStatus: 1,
            isSponsored: 1,
            type: 1,
            userPost: 1,
            advertisement: 1,
            likeObject: 1,
            commentObject: 1,
            shareObject: 1,
            seenByObject: 1,
          },
        },
      ]);
      break;

    case 'people':
      result = await User.aggregate([
        {
          $lookup: {
            from: 'showausers',
            localField: 'showaUser',
            foreignField: '_id',
            as: 'showaUser',
          },
        },
        {
          $lookup: {
            from: 'serviceprovideradmins',
            localField: 'serviceProviderAdmin',
            foreignField: '_id',
            as: 'serviceProviderAdmin',
          },
        },
        {
          $lookup: {
            from: 'serviceproviderbranchmanagers',
            localField: 'serviceProviderBranchManager',
            foreignField: '_id',
            as: 'serviceProviderBranchManager',
          },
        },
        {
          $lookup: {
            from: 'serviceproviderengineers',
            localField: 'serviceProviderEngineer',
            foreignField: '_id',
            as: 'serviceProviderEngineer',
          },
        },
        {
          $unwind: { path: '$showaUser', preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: {
            path: '$serviceProviderAdmin',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$serviceProviderBranchManager',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$serviceProviderEngineer',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $or: [
              {
                'showaUser.name.firstName': {
                  $regex: searchQuery,
                  $options: 'i',
                },
              },
              {
                'showaUser.name.lastName': {
                  $regex: searchQuery,
                  $options: 'i',
                },
              },
              {
                'serviceProviderAdmin.name.firstName': {
                  $regex: searchQuery,
                  $options: 'i',
                },
              },
              {
                'serviceProviderAdmin.name.lastName': {
                  $regex: searchQuery,
                  $options: 'i',
                },
              },
              {
                'serviceProviderBranchManager.name.firstName': {
                  $regex: searchQuery,
                  $options: 'i',
                },
              },
              {
                'serviceProviderBranchManager.name.lastName': {
                  $regex: searchQuery,
                  $options: 'i',
                },
              },
              {
                'serviceProviderEngineer.name.firstName': {
                  $regex: searchQuery,
                  $options: 'i',
                },
              },
              {
                'serviceProviderEngineer.name.lastName': {
                  $regex: searchQuery,
                  $options: 'i',
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            role: 1,
            status: 1,
            bio: 1,
            website: 1,
            fullName: {
              firstName: {
                $cond: {
                  if: { $eq: ['$role', 'showaUser'] },
                  then: '$showaUser.name.firstName',
                  else: {
                    $cond: {
                      if: { $eq: ['$role', 'serviceProviderAdmin'] },
                      then: '$serviceProviderAdmin.name.firstName',
                      else: {
                        $cond: {
                          if: {
                            $eq: ['$role', 'serviceProviderBranchManager'],
                          },
                          then: '$serviceProviderBranchManager.name.firstName',
                          else: {
                            $cond: {
                              if: { $eq: ['$role', 'serviceProviderEngineer'] },
                              then: '$serviceProviderEngineer.name.firstName',
                              else: null,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              lastName: {
                $cond: {
                  if: { $eq: ['$role', 'showaUser'] },
                  then: '$showaUser.name.lastName',
                  else: {
                    $cond: {
                      if: { $eq: ['$role', 'serviceProviderAdmin'] },
                      then: '$serviceProviderAdmin.name.lastName',
                      else: {
                        $cond: {
                          if: {
                            $eq: ['$role', 'serviceProviderBranchManager'],
                          },
                          then: '$serviceProviderBranchManager.name.lastName',
                          else: {
                            $cond: {
                              if: { $eq: ['$role', 'serviceProviderEngineer'] },
                              then: '$serviceProviderEngineer.name.lastName',
                              else: null,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            photoUrl: {
              $cond: {
                if: { $eq: ['$role', 'showaUser'] },
                then: '$showaUser.photoUrl',
                else: {
                  $cond: {
                    if: { $eq: ['$role', 'serviceProviderAdmin'] },
                    then: '$serviceProviderAdmin.photoUrl',
                    else: {
                      $cond: {
                        if: { $eq: ['$role', 'serviceProviderBranchManager'] },
                        then: '$serviceProviderBranchManager.photoUrl',
                        else: {
                          $cond: {
                            if: { $eq: ['$role', 'serviceProviderEngineer'] },
                            then: '$serviceProviderEngineer.photoUrl',
                            else: null,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            coverPhotoUrl: {
              $cond: {
                if: { $eq: ['$role', 'showaUser'] },
                then: '$showaUser.coverPhotoUrl',
                else: {
                  $cond: {
                    if: { $eq: ['$role', 'serviceProviderAdmin'] },
                    then: '$serviceProviderAdmin.coverPhotoUrl',
                    else: {
                      $cond: {
                        if: { $eq: ['$role', 'serviceProviderBranchManager'] },
                        then: '$serviceProviderBranchManager.coverPhotoUrl',
                        else: {
                          $cond: {
                            if: { $eq: ['$role', 'serviceProviderEngineer'] },
                            then: '$serviceProviderEngineer.coverPhotoUrl',
                            else: null,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            addresses: {
              $cond: {
                if: { $eq: ['$role', 'showaUser'] },
                then: '$showaUser.addresses',
                else: {
                  $cond: {
                    if: { $eq: ['$role', 'serviceProviderAdmin'] },
                    then: '$serviceProviderAdmin.addresses',
                    else: {
                      $cond: {
                        if: { $eq: ['$role', 'serviceProviderBranchManager'] },
                        then: '$serviceProviderBranchManager.addresses',
                        else: {
                          $cond: {
                            if: { $eq: ['$role', 'serviceProviderEngineer'] },
                            then: '$serviceProviderEngineer.addresses',
                            else: null,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            isFollowing: {
              $cond: {
                if: { $in: [user, { $ifNull: ['$followings', []] }] },
                then: true,
                else: false,
              },
            },
          },
        },
      ]);

      break;

      return result;

    case 'maintenance':
      result = await ServiceProviderCompany.find({
        companyName: { $regex: searchQuery, $options: 'i' },
      })
        .populate({
          path: 'serviceProviderAdmin',
          select: 'name photoUrl',
        })
        .populate({
          path: 'bank',
          select:
            'bankName branchName accountNo postalCode address departmentInCharge personInChargeName card',
        });
      break;

    default:
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid search action');
  }

  return result;
};

const editPost = async ({
  postId,
  postData,
  auth,
}: {
  postId: string;
  postData: Partial<TPost>;
  auth: TAuth;
}) => {
  if (!Types.ObjectId.isValid(postId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid post ID');
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (post.user.toString() !== auth._id.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You do not have permission to edit this post',
    );
  }

  Object.assign(post, postData);

  const updatedPost = await post.save();

  return updatedPost;
};

const hidePost = async ({ postId }: { postId: string; auth: TAuth }) => {
  if (!Types.ObjectId.isValid(postId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid post ID');
  }

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    { isHidden: true },
    { new: true },
  );

  if (!updatedPost) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  return { message: 'Post hidden successfully' };
};

const getRecentSearchForSuperAdminWeb = async ({
  searchQuery,
  action,
  user,
}: {
  searchQuery: string;
  action: TSearchType;
  user: Types.ObjectId;
}) => {
  if (searchQuery.length < 2) {
    throw new Error('Search query must contain at least 2 characters');
  }

  let result = [];

  switch (action) {
    case 'posts':
      result = await Post.aggregate([
        {
          $match: {
            $or: [
              { 'userPost.title': { $regex: searchQuery, $options: 'i' } },
              { 'advertisement.title': { $regex: searchQuery, $options: 'i' } },
            ],
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
        {
          $lookup: {
            from: 'showausers',
            localField: 'user.showaUser',
            foreignField: '_id',
            as: 'user.showaUser',
          },
        },
        {
          $lookup: {
            from: 'showaadmins',
            localField: 'user.showaAdmin',
            foreignField: '_id',
            as: 'user.showaAdmin',
          },
        },
        {
          $lookup: {
            from: 'showasubadmins',
            localField: 'user.showaSubAdmin',
            foreignField: '_id',
            as: 'user.showaSubAdmin',
          },
        },
        {
          $lookup: {
            from: 'serviceprovideradmins',
            localField: 'user.serviceProviderAdmin',
            foreignField: '_id',
            as: 'user.serviceProviderAdmin',
          },
        },
        {
          $lookup: {
            from: 'serviceprovidersubadmins',
            localField: 'user.serviceProviderSubAdmin',
            foreignField: '_id',
            as: 'user.serviceProviderSubAdmin',
          },
        },
        {
          $lookup: {
            from: 'serviceproviderengineers',
            localField: 'user.serviceProviderEngineer',
            foreignField: '_id',
            as: 'user.serviceProviderEngineer',
          },
        },
        {
          $lookup: {
            from: 'serviceproviderbranchmanagers',
            localField: 'user.serviceProviderBranchManager',
            foreignField: '_id',
            as: 'user.serviceProviderBranchManager',
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $project: {
            _id: 1,
            'user._id': 1,
            'user.role': 1,
            'user.showaUser.photoUrl': 1,
            'user.showaUser.name': 1,
            'user.showaAdmin.photoUrl': 1,
            'user.showaAdmin.name': 1,
            'user.showaSubAdmin.photoUrl': 1,
            'user.showaSubAdmin.name': 1,
            'user.serviceProviderAdmin.photoUrl': 1,
            'user.serviceProviderAdmin.name': 1,
            'user.serviceProviderSubAdmin': 1,
            'user.serviceProviderEngineer.photoUrl': 1,
            'user.serviceProviderEngineer.name': 1,
            'user.serviceProviderBranchManager.photoUrl': 1,
            'user.serviceProviderBranchManager.name': 1,
            location: 1,
            viewPrivacy: 1,
            commentPrivacy: 1,
            sharingStatus: 1,
            isSponsored: 1,
            type: 1,
            userPost: 1,
            advertisement: 1,
            createdAt: 1,
            likeObject: {
              likesCount: { $size: '$likes' },
              likes: { $slice: ['$likes', -3] },
            },
            commentObject: {
              commentsCount: { $size: '$comments' },
              comments: { $slice: ['$comments', -2] },
            },
            shareObject: {
              sharesCount: { $size: '$shares' },
              shares: { $slice: ['$shares', -2] },
            },
            seenByObject: {
              seenByCount: { $size: '$seenBy' },
              seenBy: { $slice: ['$seenBy', -3] },
            },
          },
        },
        {
          $project: {
            _id: 1,
            user: {
              _id: '$user._id',
              role: '$user.role',
              serviceProviderAdmin: {
                $arrayElemAt: ['$user.serviceProviderAdmin', 0],
              },
              showaUser: { $arrayElemAt: ['$user.showaUser', 0] },
              showaAdmin: { $arrayElemAt: ['$user.showaAdmin', 0] },
              showaSubAdmin: { $arrayElemAt: ['$user.showaSubAdmin', 0] },
              serviceProviderSubAdmin: {
                $arrayElemAt: ['$user.serviceProviderSubAdmin', 0],
              },
              serviceProviderEngineer: {
                $arrayElemAt: ['$user.serviceProviderEngineer', 0],
              },
              serviceProviderBranchManager: {
                $arrayElemAt: ['$user.serviceProviderBranchManager', 0],
              },
            },
            createdAt: 1,
            location: 1,
            viewPrivacy: 1,
            commentPrivacy: 1,
            sharingStatus: 1,
            isSponsored: 1,
            type: 1,
            userPost: 1,
            advertisement: 1,
            likeObject: 1,
            commentObject: 1,
            shareObject: 1,
            seenByObject: 1,
          },
        },
      ]);
      break;

    case 'people':
      result = await User.aggregate([
        {
          $lookup: {
            from: 'showausers',
            localField: 'showaUser',
            foreignField: '_id',
            as: 'showaUser',
          },
        },
        {
          $lookup: {
            from: 'serviceprovideradmins',
            localField: 'serviceProviderAdmin',
            foreignField: '_id',
            as: 'serviceProviderAdmin',
          },
        },
        {
          $lookup: {
            from: 'serviceproviderbranchmanagers',
            localField: 'serviceProviderBranchManager',
            foreignField: '_id',
            as: 'serviceProviderBranchManager',
          },
        },
        {
          $lookup: {
            from: 'serviceproviderengineers',
            localField: 'serviceProviderEngineer',
            foreignField: '_id',
            as: 'serviceProviderEngineer',
          },
        },
        {
          $unwind: { path: '$showaUser', preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: {
            path: '$serviceProviderAdmin',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$serviceProviderBranchManager',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$serviceProviderEngineer',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $or: [
              {
                'showaUser.name.firstName': {
                  $regex: searchQuery,
                  $options: 'i',
                },
              },
              {
                'showaUser.name.lastName': {
                  $regex: searchQuery,
                  $options: 'i',
                },
              },
              {
                'serviceProviderAdmin.name.firstName': {
                  $regex: searchQuery,
                  $options: 'i',
                },
              },
              {
                'serviceProviderAdmin.name.lastName': {
                  $regex: searchQuery,
                  $options: 'i',
                },
              },
              {
                'serviceProviderBranchManager.name.firstName': {
                  $regex: searchQuery,
                  $options: 'i',
                },
              },
              {
                'serviceProviderBranchManager.name.lastName': {
                  $regex: searchQuery,
                  $options: 'i',
                },
              },
              {
                'serviceProviderEngineer.name.firstName': {
                  $regex: searchQuery,
                  $options: 'i',
                },
              },
              {
                'serviceProviderEngineer.name.lastName': {
                  $regex: searchQuery,
                  $options: 'i',
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            role: 1,
            status: 1,
            bio: 1,
            website: 1,
            fullName: {
              firstName: {
                $cond: {
                  if: { $eq: ['$role', 'showaUser'] },
                  then: '$showaUser.name.firstName',
                  else: {
                    $cond: {
                      if: { $eq: ['$role', 'serviceProviderAdmin'] },
                      then: '$serviceProviderAdmin.name.firstName',
                      else: {
                        $cond: {
                          if: {
                            $eq: ['$role', 'serviceProviderBranchManager'],
                          },
                          then: '$serviceProviderBranchManager.name.firstName',
                          else: {
                            $cond: {
                              if: { $eq: ['$role', 'serviceProviderEngineer'] },
                              then: '$serviceProviderEngineer.name.firstName',
                              else: null,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              lastName: {
                $cond: {
                  if: { $eq: ['$role', 'showaUser'] },
                  then: '$showaUser.name.lastName',
                  else: {
                    $cond: {
                      if: { $eq: ['$role', 'serviceProviderAdmin'] },
                      then: '$serviceProviderAdmin.name.lastName',
                      else: {
                        $cond: {
                          if: {
                            $eq: ['$role', 'serviceProviderBranchManager'],
                          },
                          then: '$serviceProviderBranchManager.name.lastName',
                          else: {
                            $cond: {
                              if: { $eq: ['$role', 'serviceProviderEngineer'] },
                              then: '$serviceProviderEngineer.name.lastName',
                              else: null,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            photoUrl: {
              $cond: {
                if: { $eq: ['$role', 'showaUser'] },
                then: '$showaUser.photoUrl',
                else: {
                  $cond: {
                    if: { $eq: ['$role', 'serviceProviderAdmin'] },
                    then: '$serviceProviderAdmin.photoUrl',
                    else: {
                      $cond: {
                        if: { $eq: ['$role', 'serviceProviderBranchManager'] },
                        then: '$serviceProviderBranchManager.photoUrl',
                        else: {
                          $cond: {
                            if: { $eq: ['$role', 'serviceProviderEngineer'] },
                            then: '$serviceProviderEngineer.photoUrl',
                            else: null,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            coverPhotoUrl: {
              $cond: {
                if: { $eq: ['$role', 'showaUser'] },
                then: '$showaUser.coverPhotoUrl',
                else: {
                  $cond: {
                    if: { $eq: ['$role', 'serviceProviderAdmin'] },
                    then: '$serviceProviderAdmin.coverPhotoUrl',
                    else: {
                      $cond: {
                        if: { $eq: ['$role', 'serviceProviderBranchManager'] },
                        then: '$serviceProviderBranchManager.coverPhotoUrl',
                        else: {
                          $cond: {
                            if: { $eq: ['$role', 'serviceProviderEngineer'] },
                            then: '$serviceProviderEngineer.coverPhotoUrl',
                            else: null,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            addresses: {
              $cond: {
                if: { $eq: ['$role', 'showaUser'] },
                then: '$showaUser.addresses',
                else: {
                  $cond: {
                    if: { $eq: ['$role', 'serviceProviderAdmin'] },
                    then: '$serviceProviderAdmin.addresses',
                    else: {
                      $cond: {
                        if: { $eq: ['$role', 'serviceProviderBranchManager'] },
                        then: '$serviceProviderBranchManager.addresses',
                        else: {
                          $cond: {
                            if: { $eq: ['$role', 'serviceProviderEngineer'] },
                            then: '$serviceProviderEngineer.addresses',
                            else: null,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            isFollowing: {
              $cond: {
                if: { $in: [user, { $ifNull: ['$followings', []] }] },
                then: true,
                else: false,
              },
            },
          },
        },
      ]);

      break;

      return result;

    case 'maintenance':
      result = await ServiceProviderCompany.find({
        companyName: { $regex: searchQuery, $options: 'i' },
      })
        .populate({
          path: 'serviceProviderAdmin',
          select: 'name photoUrl',
        })
        .populate({
          path: 'bank',
          select:
            'bankName branchName accountNo postalCode address departmentInCharge personInChargeName card',
        });
      break;

    default:
      throw new Error('Invalid search action');
  }

  return result;
};

const getTopSellingProductsFromFeed = async ({
  startDate,
  endDate,
  limit = 10,
}: {
  startDate: Date;
  endDate: Date;
  limit?: number;
}) => {
  const topSellingProducts = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        'paidStatus.isPaid': true,
      },
    },
    {
      $unwind: '$product',
    },
    {
      $group: {
        _id: '$product',
        totalQuantity: { $sum: '$cost.quantity' },
        // totalRevenue: { $sum: '$cost.totalAmount' },
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    {
      $unwind: '$product',
    },
    {
      $project: {
        _id: 1,
        totalQuantity: 1,
        // totalRevenue: 1,
        'product.name': 1,
        'product.regularPrice': 1,
        'product.salePrice': 1,
        'product.stockManagement.availableStock': 1,
        'product.photos': {
          $arrayElemAt: ['$product.photos', 0],
        },
        discount: {
          $cond: {
            if: {
              $gt: ['$product.regularPrice', '$product.salePrice'],
            }, // Check if regularPrice is greater than salePrice
            then: {
              $multiply: [
                {
                  $divide: [
                    {
                      $subtract: [
                        '$product.regularPrice',
                        '$product.salePrice',
                      ],
                    },
                    '$product.regularPrice',
                  ],
                },
                100,
              ],
            },
            else: 0,
          },
        },
      },
    },
    {
      $sort: { totalQuantity: -1 },
    },
    {
      $limit: limit,
    },
  ]);

  return topSellingProducts;
};

export const postServices = {
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
  getPostByPostId,
  deletePost,
  getAllPostsByUser,
  getRecentSearchForCustomerApp,
  editPost,
  hidePost,
  getRecentSearchForSuperAdminWeb,
  getTopSellingProductsFromFeed,
};

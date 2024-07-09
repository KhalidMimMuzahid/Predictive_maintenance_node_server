import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { TAuth } from '../../../interface/error';
import { TPost, TReplay, TSharingStatus } from './post.interface';
import Post from './post.model';
import mongoose from 'mongoose';
import { User } from '../../user/user.model';

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
    {
      $project: {
        _id: 1,
        // for user start
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
        user:{
          role: '$user.role',

                serviceProviderAdmin: {
                  $arrayElemAt: ["$user.serviceProviderAdmin", 0]
                },
                showaUser: {
                    $arrayElemAt: ["$user.showaUser", 0]
                },
                showaAdmin: {
                    $arrayElemAt: ["$user.showaAdmin", 0]
                },
                showaSubAdmin: {
                    $arrayElemAt: ["$user.showaSubAdmin", 0]
                },
                serviceProviderSubAdmin: {
                    $arrayElemAt: ["$user.serviceProviderSubAdmin", 0]
                },
                serviceProviderEngineer: {
                    $arrayElemAt: ["$user.serviceProviderEngineer", 0]
                },
                serviceProviderBranchManager: {
                    $arrayElemAt: ["$user.serviceProviderBranchManager", 0]
                },
        },
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
      user: { $in: followingUsers },
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
};

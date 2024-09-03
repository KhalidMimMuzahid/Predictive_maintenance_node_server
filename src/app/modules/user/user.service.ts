import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from './user.model';
import { jwtFunc } from '../../utils/jwtFunction';
import { TAuth } from '../../interface/error';
import { users } from '../../../server';

// 'showaAdmin'
// 'showaSubAdmin'
// 'serviceProviderAdmin'
// 'serviceProviderSubAdmin'
// 'serviceProviderEngineer'
// 'serviceProviderBranchManager'
// 'serviceProviderSupportStuff'

const signIn = async (uid: string) => {
  const user = await User.findOne({ uid }).populate([
    {
      path: 'showaUser',
      options: { strictPopulate: false },
    },
    {
      path: 'showaAdmin',
      options: { strictPopulate: false },
    },
    {
      path: 'showaSubAdmin',
      options: { strictPopulate: false },
    },
    {
      path: 'serviceProviderAdmin',
      options: { strictPopulate: false },
      populate: {
        path: 'serviceProviderCompany',
        options: { strictPopulate: false },
        populate: {
          path: 'branches',
          options: { strictPopulate: false },
        },
      },
    },
    {
      path: 'serviceProviderSubAdmin',
      options: { strictPopulate: false },
    },
    {
      path: 'serviceProviderEngineer',
      options: { strictPopulate: false },
    },
    {
      path: 'serviceProviderBranchManager',
      options: { strictPopulate: false },
    },
    {
      path: 'serviceProviderSupportStuff',
      options: { strictPopulate: false },
    },
    // // for no we no need wallet in this api; cause for get wallet we have another api
    // {
    //   path: 'wallet',
    //   options: { strictPopulate: false },
    // },
  ]);
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'no user founded with this uid');
  }
  const token = jwtFunc.generateToken(
    user?.email as string,
    user?._id.toString(),
    user?.uid as string,
    user?.role as string,
  );

  return { user, token };
};
const getUserBy_id = async ({
  _id,
  rootUserFields,
  extendedUserFields,
}: {
  _id: string;
  rootUserFields?: string;
  extendedUserFields?: string;
}) => {
  // const
  const user = await User.findById(_id)
    .select(rootUserFields)
    .populate([
      {
        path: 'showaUser',
        select: extendedUserFields,
        options: { strictPopulate: false },
      },

      {
        path: 'showaAdmin',
        select: extendedUserFields,
        options: { strictPopulate: false },
      },

      {
        path: 'showaSubAdmin',
        select: extendedUserFields,
        options: { strictPopulate: false },
      },

      {
        path: 'serviceProviderAdmin',
        select: extendedUserFields,
        options: { strictPopulate: false },
        populate: {
          path: 'serviceProviderCompany',
          options: { strictPopulate: false },
          populate: {
            path: 'branches',
            options: { strictPopulate: false },
          },
        },
      },
      {
        path: 'serviceProviderSubAdmin',
        select: extendedUserFields,
        options: { strictPopulate: false },
      },
      {
        path: 'serviceProviderEngineer',
        select: extendedUserFields,
        options: { strictPopulate: false },
      },
      {
        path: 'serviceProviderBranchManager',
        select: extendedUserFields,
        options: { strictPopulate: false },
      },
      {
        path: 'serviceProviderSupportStuff',
        select: extendedUserFields,
        options: { strictPopulate: false },
      },
      // // for no we no need wallet in this api; cause for get wallet we have another api
      {
        path: 'wallet',
        options: { strictPopulate: false },
      },
    ]);

  return user;
};

const checkUserOnlineByUser = async (user: string) => {
  return { isActive: users.has(user) };
};
const getUsersInfoByUsersArray = async ({
  usersArray,
  rootUserFields,
  extendedUserFields,
}: {
  usersArray: string[];
  rootUserFields: string;
  extendedUserFields: string;
}) => {
  const users = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    usersArray.map(async (user: any) => {
      const userData = await User.findById(user)
        .select(rootUserFields)
        .populate([
          {
            path: 'showaUser',
            select: extendedUserFields,
            options: { strictPopulate: false },
          },

          {
            path: 'showaAdmin',
            select: extendedUserFields,
            options: { strictPopulate: false },
          },

          {
            path: 'showaSubAdmin',
            select: extendedUserFields,
            options: { strictPopulate: false },
          },

          {
            path: 'serviceProviderAdmin',
            select: extendedUserFields,
            options: { strictPopulate: false },
            populate: {
              path: 'serviceProviderCompany',
              options: { strictPopulate: false },
              populate: {
                path: 'branches',
                options: { strictPopulate: false },
              },
            },
          },
          {
            path: 'serviceProviderSubAdmin',
            select: extendedUserFields,
            options: { strictPopulate: false },
          },
          {
            path: 'serviceProviderEngineer',
            select: extendedUserFields,
            options: { strictPopulate: false },
          },
          {
            path: 'serviceProviderBranchManager',
            select: extendedUserFields,
            options: { strictPopulate: false },
          },
          {
            path: 'serviceProviderSupportStuff',
            select: extendedUserFields,
            options: { strictPopulate: false },
          },
        ]);
      return userData;
    }),
  );

  return users;
};
const getUserWalletInfo = async (uid: string) => {
  const user = await User.findOne({ uid: uid }).populate([
    {
      path: 'wallet',
      options: { strictPopulate: false },
    },
  ]);

  return user;
};

const getAllShowaCustomersFromDB = async () => {
  const showaCustomers = await User.find({ role: 'showaUser' }).populate([
    {
      path: 'showaUser',
      options: { strictPopulate: false },
    },
    {
      path: 'wallet',
      options: { strictPopulate: false },
    },
  ]);

  return showaCustomers;
};

const followUser = async ({ user, auth }: { user: string; auth: TAuth }) => {
  // const updatedPost =
  const userData = await User.findById(user).select('_id');

  if (!userData) {
    throw new AppError(httpStatus.BAD_REQUEST, `user you provide is not found`);
  }
  await User.findByIdAndUpdate(auth?._id?.toString(), {
    $addToSet: { followings: userData?._id },
  });

  // console.log(updatedPost);

  return null;
};

const unfollowUser = async ({ user, auth }: { user: string; auth: TAuth }) => {
  // const updatedPost =
  const userData = await User.findById(user).select('_id');

  if (!userData) {
    throw new AppError(httpStatus.BAD_REQUEST, `user you provide is not found`);
  }
  await User.findByIdAndUpdate(auth?._id?.toString(), {
    $pull: { followings: userData?._id },
  });

  // console.log(updatedPost);

  return null;
};

export const userServices = {
  signIn,
  getUserBy_id,
  checkUserOnlineByUser,
  getUsersInfoByUsersArray,
  getAllShowaCustomersFromDB,
  getUserWalletInfo,
  followUser,
  unfollowUser,
};

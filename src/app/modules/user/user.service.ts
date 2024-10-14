import httpStatus from 'http-status';
import { users } from '../../../server';
import AppError from '../../errors/AppError';
import { TAuth } from '../../interface/error';
import { jwtFunc } from '../../utils/jwtFunction';
import {
  TServiceProviderAdmin,
  TServiceProviderBranchManager,
  TServiceProviderEngineer,
  TShowaUser,
} from '../extraData/extraData.interface';
import { TUser } from './user.interface';
import { User } from './user.model';
import { ServiceProviderBranchManager } from './usersModule/branchManager/branchManager.model';
import { ServiceProviderAdmin } from './usersModule/serviceProviderAdmin/serviceProviderAdmin.model';
import { ServiceProviderEngineer } from './usersModule/serviceProviderEngineer/serviceProviderEngineer.model';
import { ShowaUser } from './usersModule/showaUsers/showaUser.model';

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

// const editUserProfile = async ({
//   user,
//   showaUser,
//   serviceProviderAdmin,
//   serviceProviderBranchManager,
//   serviceProviderEngineer,
// }: {
//   user?: Partial<TUser>;
//   showaUser?: Partial<TShowaUser>;
//   serviceProviderAdmin?: Partial<TServiceProviderAdmin>;
//   serviceProviderBranchManager?: Partial<TServiceProviderBranchManager>;
//   serviceProviderEngineer?: Partial<TServiceProviderEngineer>;
// }) => {
//   let updatedUser = null;

//   if (user) {
//     updatedUser = await User.findOneAndUpdate(user, {
//       new: true,
//       runValidators: true,
//     });
//     if (!updatedUser) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
//     }
//   }
//   console.log(user);
//   if (showaUser) {
//     const updatedShowaUser = await ShowaUser.findOneAndUpdate(showaUser, {
//       new: true,
//       runValidators: true,
//     });
//     if (!updatedShowaUser) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'Showa user not found');
//     }
//   }

//   if (serviceProviderAdmin) {
//     const updatedServiceProviderAdmin =
//       await ServiceProviderAdmin.findOneAndUpdate(serviceProviderAdmin, {
//         new: true,
//         runValidators: true,
//       });
//     if (!updatedServiceProviderAdmin) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'Service provider admin not found',
//       );
//     }
//   }

//   if (serviceProviderBranchManager) {
//     const updatedBranchManager =
//       await ServiceProviderBranchManager.findOneAndUpdate(
//         serviceProviderBranchManager,
//         { new: true, runValidators: true },
//       );
//     if (!updatedBranchManager) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'Service provider branch manager not found',
//       );
//     }
//   }

//   if (serviceProviderEngineer) {
//     const updatedEngineer = await ServiceProviderEngineer.findOneAndUpdate(
//       serviceProviderEngineer,
//       { new: true, runValidators: true },
//     );
//     if (!updatedEngineer) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'Service provider engineer not found',
//       );
//     }
//   }

//   return {
//     updatedUser,
//   };
// };

const editUserProfile = async ({
  user,
  showaUser,
  serviceProviderAdmin,
  serviceProviderBranchManager,
  serviceProviderEngineer,
}: {
  user?: { _id: string } & Partial<TUser>;
  showaUser?: { user: string } & Partial<TShowaUser>;
  serviceProviderAdmin?: { user: string } & Partial<TServiceProviderAdmin>;
  serviceProviderBranchManager?: {
    user: string;
  } & Partial<TServiceProviderBranchManager>;
  serviceProviderEngineer?: {
    user: string;
  } & Partial<TServiceProviderEngineer>;
}) => {
  const updatedUsers = []; // Array to store updated user objects

  // Update logic for user
  if (user && user._id) {
    const updatedUser = await User.findOneAndUpdate({ _id: user._id }, user, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) {
      console.error(`User not found for ID: ${user._id}`);
      throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
    }
    updatedUsers.push(updatedUser);
  }

  // Update logic for showaUser
  if (showaUser && showaUser.user) {
    const updatedShowaUser = await ShowaUser.findOneAndUpdate(
      { _id: showaUser.user },
      showaUser,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!updatedShowaUser) {
      console.error(`Showa user not found for ID: ${showaUser.user}`);
      throw new AppError(httpStatus.BAD_REQUEST, 'Showa user not found');
    }
    updatedUsers.push(updatedShowaUser);
  }

  // Update logic for serviceProviderAdmin
  if (serviceProviderAdmin && serviceProviderAdmin.user) {
    const updatedServiceProviderAdmin =
      await ServiceProviderAdmin.findOneAndUpdate(
        { _id: serviceProviderAdmin.user },
        serviceProviderAdmin,
        {
          new: true,
          runValidators: true,
        },
      );
    if (!updatedServiceProviderAdmin) {
      console.error(
        `Service provider admin not found for ID: ${serviceProviderAdmin.user}`,
      );
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Service provider admin not found',
      );
    }
    updatedUsers.push(updatedServiceProviderAdmin);
  }

  // Update logic for serviceProviderBranchManager
  if (serviceProviderBranchManager && serviceProviderBranchManager.user) {
    const updatedBranchManager =
      await ServiceProviderBranchManager.findOneAndUpdate(
        { _id: serviceProviderBranchManager.user },
        serviceProviderBranchManager,
        {
          new: true,
          runValidators: true,
        },
      );
    if (!updatedBranchManager) {
      console.error(
        `Service provider branch manager not found for ID: ${serviceProviderBranchManager.user}`,
      );
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Service provider branch manager not found',
      );
    }
    updatedUsers.push(updatedBranchManager);
  }

  // Update logic for serviceProviderEngineer
  if (serviceProviderEngineer && serviceProviderEngineer.user) {
    const updatedEngineer = await ServiceProviderEngineer.findOneAndUpdate(
      { _id: serviceProviderEngineer.user },
      serviceProviderEngineer,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!updatedEngineer) {
      console.error(
        `Service provider engineer not found for ID: ${serviceProviderEngineer.user}`,
      );
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Service provider engineer not found',
      );
    }
    updatedUsers.push(updatedEngineer);
  }

  return updatedUsers; // Return updated user objects
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
  editUserProfile,
};

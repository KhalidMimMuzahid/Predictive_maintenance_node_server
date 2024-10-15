import httpStatus from 'http-status';
import { users } from '../../../server';
import AppError from '../../errors/AppError';
import { TAuth } from '../../interface/error';
import { jwtFunc } from '../../utils/jwtFunction';
// import {
//   TServiceProviderAdmin,
//   TServiceProviderBranchManager,
//   TServiceProviderEngineer,
//   TShowaUser,
// } from '../extraData/extraData.interface';
import { TUser } from './user.interface';
import { User } from './user.model';
import { ServiceProviderBranchManager } from './usersModule/branchManager/branchManager.model';
import { ServiceProviderAdmin } from './usersModule/serviceProviderAdmin/serviceProviderAdmin.model';
import { ServiceProviderEngineer } from './usersModule/serviceProviderEngineer/serviceProviderEngineer.model';
import { ShowaUser } from './usersModule/showaUsers/showaUser.model';
import mongoose from 'mongoose';
import { TShowaUser } from './usersModule/showaUsers/showaUser.interface';
import { TServiceProviderAdmin } from './usersModule/serviceProviderAdmin/serviceProviderAdmin.interface';
import { TServiceProviderBranchManager } from './usersModule/branchManager/branchManager.interface';
import { TServiceProviderEngineer } from './usersModule/serviceProviderEngineer/serviceProviderEngineer.interface';

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
  auth,
  user,
  showaUser,
  serviceProviderAdmin,
  serviceProviderBranchManager,
  serviceProviderEngineer,
}: {
  auth: TAuth;
  user: Partial<TUser>;
  showaUser?: Partial<TShowaUser>;
  serviceProviderAdmin?: Partial<TServiceProviderAdmin>;
  serviceProviderBranchManager?: Partial<TServiceProviderBranchManager>;
  serviceProviderEngineer?: Partial<TServiceProviderEngineer>;
}) => {
  const userData = await User.findById(auth?._id?.toString()).select(
    '_id role showaUser serviceProviderAdmin serviceProviderBranchManager serviceProviderEngineer',
  );

  if (!userData) {
    throw new AppError(httpStatus.BAD_REQUEST, `user you provide is not found`);
  }

  // return { okk: 'fuck you' };

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    //
    // userName: z.string().optional(),
    // bio: z.string().optional(),
    // website: z.string().optional(),
    if (user?.userName) {
      userData.userName = user?.userName;
    }
    if (user?.bio) {
      userData.bio = user?.bio;
    }
    if (user?.website) {
      userData.website = user?.website;
    }
    const updatedUserData = await userData.save({ session });
    if (!updatedUserData) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }

    // showaUser?: Partial<TShowaUser>;
    // serviceProviderAdmin?: Partial<TServiceProviderAdmin>;
    // serviceProviderBranchManager?: Partial<TServiceProviderBranchManager>;
    // serviceProviderEngineer?:

    if (user?.role === 'showaUser' && user?.showaUser?.toString()) {
      const showaUserData = await ShowaUser.findById(
        user?.showaUser?.toString(),
      );
      if (!showaUserData) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'something went wrong, please try again',
        );
      }
      if (showaUser?.name) {
        showaUserData.name = showaUser?.name;
      }
      if (showaUser?.occupation) {
        showaUserData.occupation = showaUser?.occupation;
      }
      if (showaUser?.dateOfBirth) {
        showaUserData.dateOfBirth = new Date(showaUser?.dateOfBirth);
      }
      if (showaUser?.photoUrl) {
        showaUserData.photoUrl = showaUser?.photoUrl;
      }
      if (showaUser?.coverPhotoUrl) {
        showaUserData.coverPhotoUrl = showaUser?.coverPhotoUrl;
      }

      const updatedShowaUser = await showaUserData.save({ session });
      if (!updatedShowaUser) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'something went wrong, please try again',
        );
      }
      // if (showaUser?.addresses) {
      //   // showaUserData.occupation = showaUser?.occupation
      //   // work on that
      // }
    } else if (
      user?.role === 'serviceProviderAdmin' &&
      user?.serviceProviderAdmin?.toString()
    ) {
      const serviceProviderAdminData = await ServiceProviderAdmin.findById(
        user?.serviceProviderAdmin?.toString(),
      );
      if (!serviceProviderAdminData) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'something went wrong, please try again',
        );
      }
      if (serviceProviderAdmin?.name) {
        serviceProviderAdminData.name = serviceProviderAdmin?.name;
      }
      if (serviceProviderAdmin?.occupation) {
        serviceProviderAdminData.occupation = serviceProviderAdmin?.occupation;
      }
      if (serviceProviderAdmin?.dateOfBirth) {
        serviceProviderAdminData.dateOfBirth = new Date(
          serviceProviderAdmin?.dateOfBirth,
        );
      }
      if (serviceProviderAdmin?.photoUrl) {
        serviceProviderAdminData.photoUrl = serviceProviderAdmin?.photoUrl;
      }
      if (serviceProviderAdmin?.coverPhotoUrl) {
        serviceProviderAdminData.coverPhotoUrl =
          serviceProviderAdmin?.coverPhotoUrl;
      }

      const updatedServiceProviderAdmin = await serviceProviderAdminData.save({
        session,
      });
      if (!updatedServiceProviderAdmin) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'something went wrong, please try again',
        );
      }
    } else if (
      user?.role === 'serviceProviderBranchManager' &&
      user?.serviceProviderBranchManager?.toString()
    ) {
      const serviceProviderBranchManagerData =
        await ServiceProviderBranchManager.findById(
          user?.serviceProviderBranchManager?.toString(),
        );
      if (!serviceProviderBranchManagerData) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'something went wrong, please try again',
        );
      }
      if (serviceProviderBranchManager?.name) {
        serviceProviderBranchManagerData.name =
          serviceProviderBranchManager?.name;
      }
      if (serviceProviderBranchManager?.occupation) {
        serviceProviderBranchManagerData.occupation =
          serviceProviderBranchManager?.occupation;
      }
      if (serviceProviderBranchManager?.dateOfBirth) {
        serviceProviderBranchManagerData.dateOfBirth = new Date(
          serviceProviderBranchManager?.dateOfBirth,
        );
      }
      if (serviceProviderBranchManager?.photoUrl) {
        serviceProviderBranchManagerData.photoUrl =
          serviceProviderBranchManager?.photoUrl;
      }
      if (serviceProviderBranchManager?.coverPhotoUrl) {
        serviceProviderBranchManagerData.coverPhotoUrl =
          serviceProviderBranchManager?.coverPhotoUrl;
      }

      const updatedServiceProviderBranchManager =
        await serviceProviderBranchManagerData.save({ session });
      if (!updatedServiceProviderBranchManager) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'something went wrong, please try again',
        );
      }
    } else if (
      user?.role === 'serviceProviderEngineer' &&
      user?.serviceProviderEngineer?.toString()
    ) {
      const serviceProviderEngineerData =
        await ServiceProviderEngineer.findById(
          user?.serviceProviderEngineer?.toString(),
        );
      if (!serviceProviderEngineerData) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'something went wrong, please try again',
        );
      }
      if (serviceProviderEngineer?.name) {
        serviceProviderEngineerData.name = serviceProviderEngineer?.name;
      }
      if (serviceProviderEngineer?.occupation) {
        serviceProviderEngineerData.occupation =
          serviceProviderEngineer?.occupation;
      }
      if (serviceProviderEngineer?.dateOfBirth) {
        serviceProviderEngineerData.dateOfBirth = new Date(
          serviceProviderEngineer?.dateOfBirth,
        );
      }
      if (serviceProviderEngineer?.photoUrl) {
        serviceProviderEngineerData.photoUrl =
          serviceProviderEngineer?.photoUrl;
      }
      if (serviceProviderEngineer?.coverPhotoUrl) {
        serviceProviderEngineerData.coverPhotoUrl =
          serviceProviderEngineer?.coverPhotoUrl;
      }

      const updatedServiceProviderEngineer =
        await serviceProviderEngineerData.save({ session });
      if (!updatedServiceProviderEngineer) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'something went wrong, please try again',
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

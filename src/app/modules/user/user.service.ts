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
import mongoose from 'mongoose';
import { TAddress } from '../common/common.interface';
import { TUser } from './user.interface';
import { User } from './user.model';
import { TServiceProviderBranchManager } from './usersModule/branchManager/branchManager.interface';
import { ServiceProviderBranchManager } from './usersModule/branchManager/branchManager.model';
import { TServiceProviderAdmin } from './usersModule/serviceProviderAdmin/serviceProviderAdmin.interface';
import { ServiceProviderAdmin } from './usersModule/serviceProviderAdmin/serviceProviderAdmin.model';
import { TServiceProviderEngineer } from './usersModule/serviceProviderEngineer/serviceProviderEngineer.interface';
import { ServiceProviderEngineer } from './usersModule/serviceProviderEngineer/serviceProviderEngineer.model';
import { TShowaUser } from './usersModule/showaUsers/showaUser.interface';
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
  auth,
  user_id,
  user,
  showaUser,
  serviceProviderAdmin,
  serviceProviderBranchManager,
  serviceProviderEngineer,
}: {
  auth: TAuth;
  user_id: string;
  user: Partial<TUser>;
  showaUser?: Partial<TShowaUser>;
  serviceProviderAdmin?: Partial<TServiceProviderAdmin>;
  serviceProviderBranchManager?: Partial<TServiceProviderBranchManager>;
  serviceProviderEngineer?: Partial<TServiceProviderEngineer>;
}) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  let userData: mongoose.Document<unknown, {}, TUser> &
    TUser & {
      _id: mongoose.Types.ObjectId;
    } & {
      __v?: number;
    };

  // if this req send by showa admin and also send a user_id, this this user will be updated
  if (auth?.role === 'showaAdmin' && user_id) {
    userData = await User.findById(user_id).select(
      '_id role showaUser serviceProviderAdmin serviceProviderBranchManager serviceProviderEngineer',
    );
  } else {
    // else who send this request, whose info will be updated
    userData = await User.findById(auth?._id?.toString()).select(
      '_id role showaUser serviceProviderAdmin serviceProviderBranchManager serviceProviderEngineer',
    );
  }
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

    if (userData?.role === 'showaUser' && userData?.showaUser?.toString()) {
      const showaUserData = await ShowaUser.findById(
        userData?.showaUser?.toString(),
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
      userData?.role === 'serviceProviderAdmin' &&
      userData?.serviceProviderAdmin?.toString()
    ) {
      const serviceProviderAdminData = await ServiceProviderAdmin.findById(
        userData?.serviceProviderAdmin?.toString(),
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
      userData?.role === 'serviceProviderBranchManager' &&
      userData?.serviceProviderBranchManager?.toString()
    ) {
      const serviceProviderBranchManagerData =
        await ServiceProviderBranchManager.findById(
          userData?.serviceProviderBranchManager?.toString(),
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
      userData?.role === 'serviceProviderEngineer' &&
      userData?.serviceProviderEngineer?.toString()
    ) {
      const serviceProviderEngineerData =
        await ServiceProviderEngineer.findById(
          userData?.serviceProviderEngineer?.toString(),
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

// const editUserAddress = async ({
//   auth,
//   addresses,
// }: {
//   auth: TAuth;
//   addresses: { isDeleted: boolean; address: TAddress }[];
// }) => {
//   const address = addresses;

//   const userData = await User.findById(auth?._id?.toString()).select(
//     '_id role showaUser serviceProviderAdmin serviceProviderBranchManager serviceProviderEngineer',
//   );

//   if (!userData) {
//     throw new AppError(httpStatus.BAD_REQUEST, `User not found`);
//   }

//   if (userData.role === 'showaUser' && userData?.showaUser) {
//     const showaUserData = await ShowaUser.findById(
//       userData.showaUser.toString(),
//     );
//     if (!showaUserData) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'Showa user not found');
//     }

//     showaUserData.addresses = address;

//     const updatedShowaUser = await showaUserData.save();
//     if (!updatedShowaUser) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update Showa user');
//     }
//   } else if (
//     userData.role === 'serviceProviderAdmin' &&
//     userData?.serviceProviderAdmin
//   ) {
//     const serviceProviderAdminData = await ServiceProviderAdmin.findById(
//       userData.serviceProviderAdmin.toString(),
//     );
//     if (!serviceProviderAdminData) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'Service provider admin not found',
//       );
//     }

//     serviceProviderAdminData.addresses = address;

//     const updatedServiceProviderAdmin = await serviceProviderAdminData.save();
//     if (!updatedServiceProviderAdmin) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'Failed to update Service Provider Admin',
//       );
//     }
//   } else if (
//     userData.role === 'serviceProviderBranchManager' &&
//     userData?.serviceProviderBranchManager
//   ) {
//     const serviceProviderBranchManagerData =
//       await ServiceProviderBranchManager.findById(
//         userData.serviceProviderBranchManager.toString(),
//       );
//     if (!serviceProviderBranchManagerData) {
//       throw new AppError(httpStatus.BAD_REQUEST, 'Branch Manager not found');
//     }

//     serviceProviderBranchManagerData.addresses = address;

//     const updatedServiceProviderBranchManager =
//       await serviceProviderBranchManagerData.save();
//     if (!updatedServiceProviderBranchManager) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'Failed to update Branch Manager',
//       );
//     }
//   } else if (
//     userData.role === 'serviceProviderEngineer' &&
//     userData?.serviceProviderEngineer
//   ) {
//     const serviceProviderEngineerData = await ServiceProviderEngineer.findById(
//       userData.serviceProviderEngineer.toString(),
//     );
//     if (!serviceProviderEngineerData) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'ServiceProviderEngineer not found',
//       );
//     }

//     serviceProviderEngineerData.addresses = address;

//     const updatedServiceProviderEngineer =
//       await serviceProviderEngineerData.save();
//     if (!updatedServiceProviderEngineer) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'Failed to update ServiceProviderEngineer',
//       );
//     }
//   } else {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'Invalid role for editing addresses',
//     );
//   }

//   return true;
// };

const editUserAddress = async ({
  auth,
  addresses,
}: {
  auth: TAuth;
  addresses: Partial<{ isDeleted: boolean; address: TAddress }>[];
}) => {
  const userData = await User.findById(auth?._id?.toString()).select(
    '_id role showaUser serviceProviderAdmin serviceProviderBranchManager serviceProviderEngineer',
  );

  if (!userData) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  const updateAddresses = (
    existingAddresses: { isDeleted: boolean; address: TAddress }[],
    newAddresses: Partial<{ isDeleted: boolean; address: TAddress }>[],
  ): { isDeleted: boolean; address: TAddress }[] => {
    return newAddresses.map((newAddress, index) => {
      const existingAddress = existingAddresses[index] || {
        isDeleted: false,
        address: {} as TAddress,
      };
      return {
        isDeleted:
          newAddress.isDeleted !== undefined
            ? newAddress.isDeleted
            : existingAddress.isDeleted,
        address: {
          googleString:
            newAddress.address?.googleString ??
            existingAddress.address.googleString,
          location: {
            latitude:
              newAddress.address?.location?.latitude ??
              existingAddress.address.location?.latitude,
            longitude:
              newAddress.address?.location?.longitude ??
              existingAddress.address.location?.longitude,
          },
          street: newAddress.address?.street ?? existingAddress.address.street,
          city: newAddress.address?.city ?? existingAddress.address.city,
          prefecture:
            newAddress.address?.prefecture ??
            existingAddress.address.prefecture,
          postalCode:
            newAddress.address?.postalCode ??
            existingAddress.address.postalCode,
          country:
            newAddress.address?.country ?? existingAddress.address.country,
          buildingName:
            newAddress.address?.buildingName ??
            existingAddress.address.buildingName,
          roomNumber:
            newAddress.address?.roomNumber ??
            existingAddress.address.roomNumber,
          state: newAddress.address?.state ?? existingAddress.address.state,
          details:
            newAddress.address?.details ?? existingAddress.address.details,
        },
      };
    });
  };

  if (userData.role === 'showaUser' && userData?.showaUser) {
    const showaUserData = await ShowaUser.findById(
      userData.showaUser.toString(),
    );
    if (!showaUserData) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Showa user not found');
    }

    showaUserData.addresses = updateAddresses(
      showaUserData.addresses,
      addresses,
    );

    const updatedShowaUser = await showaUserData.save();
    if (!updatedShowaUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update Showa user');
    }
  } else if (
    userData.role === 'serviceProviderAdmin' &&
    userData?.serviceProviderAdmin
  ) {
    const serviceProviderAdminData = await ServiceProviderAdmin.findById(
      userData.serviceProviderAdmin.toString(),
    );
    if (!serviceProviderAdminData) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Service provider admin not found',
      );
    }

    serviceProviderAdminData.addresses = updateAddresses(
      serviceProviderAdminData.addresses,
      addresses,
    );

    const updatedServiceProviderAdmin = await serviceProviderAdminData.save();
    if (!updatedServiceProviderAdmin) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to update Service Provider Admin',
      );
    }
  } else if (
    userData.role === 'serviceProviderBranchManager' &&
    userData?.serviceProviderBranchManager
  ) {
    const serviceProviderBranchManagerData =
      await ServiceProviderBranchManager.findById(
        userData.serviceProviderBranchManager.toString(),
      );
    if (!serviceProviderBranchManagerData) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Branch Manager not found');
    }

    serviceProviderBranchManagerData.addresses = updateAddresses(
      serviceProviderBranchManagerData.addresses,
      addresses,
    );

    const updatedServiceProviderBranchManager =
      await serviceProviderBranchManagerData.save();
    if (!updatedServiceProviderBranchManager) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to update Branch Manager',
      );
    }
  } else if (
    userData.role === 'serviceProviderEngineer' &&
    userData?.serviceProviderEngineer
  ) {
    const serviceProviderEngineerData = await ServiceProviderEngineer.findById(
      userData.serviceProviderEngineer.toString(),
    );
    if (!serviceProviderEngineerData) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'ServiceProviderEngineer not found',
      );
    }

    serviceProviderEngineerData.addresses = updateAddresses(
      serviceProviderEngineerData.addresses,
      addresses,
    );

    const updatedServiceProviderEngineer =
      await serviceProviderEngineerData.save();
    if (!updatedServiceProviderEngineer) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to update ServiceProviderEngineer',
      );
    }
  } else {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid role for editing addresses',
    );
  }

  return true;
};

const addNewAddress = async ({
  auth,
  addresses,
}: {
  auth: TAuth;
  addresses: { isDeleted?: boolean; address: TAddress }[];
}) => {
  const userData = await User.findById(auth?._id?.toString()).select(
    '_id role showaUser serviceProviderAdmin serviceProviderBranchManager serviceProviderEngineer',
  );

  if (!userData) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  // Function to add new addresses
  const addAddresses = (
    existingAddresses: { isDeleted: boolean; address: TAddress }[],
    newAddresses: { isDeleted?: boolean; address: TAddress }[],
  ): { isDeleted: boolean; address: TAddress }[] => {
    return [
      ...existingAddresses,
      ...newAddresses.map((address) => ({
        isDeleted: address.isDeleted ?? false,
        address: address.address,
      })),
    ];
  };

  if (userData.role === 'showaUser' && userData?.showaUser) {
    const showaUserData = await ShowaUser.findById(
      userData.showaUser.toString(),
    );
    if (!showaUserData) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Showa user not found');
    }

    showaUserData.addresses = addAddresses(showaUserData.addresses, addresses);
    await showaUserData.save();
  } else if (
    userData.role === 'serviceProviderAdmin' &&
    userData?.serviceProviderAdmin
  ) {
    const serviceProviderAdminData = await ServiceProviderAdmin.findById(
      userData.serviceProviderAdmin.toString(),
    );
    if (!serviceProviderAdminData) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Service provider admin not found',
      );
    }

    serviceProviderAdminData.addresses = addAddresses(
      serviceProviderAdminData.addresses,
      addresses,
    );
    await serviceProviderAdminData.save();
  } else if (
    userData.role === 'serviceProviderBranchManager' &&
    userData?.serviceProviderBranchManager
  ) {
    const serviceProviderBranchManagerData =
      await ServiceProviderBranchManager.findById(
        userData.serviceProviderBranchManager.toString(),
      );
    if (!serviceProviderBranchManagerData) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Branch Manager not found');
    }

    serviceProviderBranchManagerData.addresses = addAddresses(
      serviceProviderBranchManagerData.addresses,
      addresses,
    );
    await serviceProviderBranchManagerData.save();
  } else if (
    userData.role === 'serviceProviderEngineer' &&
    userData?.serviceProviderEngineer
  ) {
    const serviceProviderEngineerData = await ServiceProviderEngineer.findById(
      userData.serviceProviderEngineer.toString(),
    );
    if (!serviceProviderEngineerData) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'ServiceProviderEngineer not found',
      );
    }

    serviceProviderEngineerData.addresses = addAddresses(
      serviceProviderEngineerData.addresses,
      addresses,
    );
    await serviceProviderEngineerData.save();
  } else {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid role for adding new address',
    );
  }

  return { success: true };
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
  editUserAddress,
  addNewAddress,
};

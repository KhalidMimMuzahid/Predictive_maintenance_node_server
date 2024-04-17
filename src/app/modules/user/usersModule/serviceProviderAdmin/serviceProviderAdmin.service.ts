import mongoose from 'mongoose';
import { TUser } from '../../user.interface';
import { TServiceProviderAdmin } from './serviceProviderAdmin.interface';
import { User } from '../../user.model';
import AppError from '../../../../errors/AppError';
import httpStatus from 'http-status';
import { Wallet } from '../../../wallet/wallet.model';

const createServiceProviderAdminIntoDB = async (
  rootUser: Partial<TUser>,
  serviceProviderAdmin: Partial<TServiceProviderAdmin>,
) => {
  //create a user object
  rootUser.role = 'service-provider-admin';
  // rootUser.isDeleted= false // same as above
  // rootUser.status =  'approved'  // same as above

  // checking if the user is already created with this user or not
  const isUidExists = await User.isUidExists(rootUser?.uid as string);
  if (isUidExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'uid is already in use');
  }
  const isEmailExists = await User.isEmailExists(rootUser?.email as string);
  if (isEmailExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'email is already in use');
  }

  // creating the session
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const createdUserArray = await User.create([rootUser], {
      session: session,
    });
    if (!createdUserArray?.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
    }
    const createdUser = createdUserArray[0];
    const createdWalletArray = await Wallet.create(
      [
        {
          user: createdUser?._id,
          cards: [],
          balance: 0,
          point: 0,
          showaMB: 0,
        },
      ],
      {
        session: session,
      },
    );

    if (!createdWalletArray?.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
    }
    const createdWallet = createdWalletArray[0];

    serviceProviderAdmin.user = createdUser?._id;
    // serviceProviderAdmin.isDeleted= false // we no need to set it ; cause we have already set it as a default value in mongoose model
    const createdShowaUserArray = await ShowaUser.create([showaUser], {
      session: session,
    });
    if (!createdShowaUserArray?.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
    }

    const createdShowaUser = createdShowaUserArray[0];
    const updatedUser = await User.findByIdAndUpdate(
      createdUser?._id,
      {
        wallet: createdWallet?._id,
        showaUser: createdShowaUser?._id,
      },
      { new: true, session: session },
    );
    if (!updatedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
    }
    const user = await User.findById(createdUser?._id).populate([
      {
        path: 'showaUser',
        options: { strictPopulate: false },
      },
      // // for no we no need wallet in this api; cause for get wallet we have another api
      // {
      //   path: 'wallet',
      //   options: { strictPopulate: false },
      // },
    ]);
    const token = jwtFunc.generateToken(
      user?.email as string,
      user?._id.toString(),
      user?.uid as string,
    );

    await session.commitTransaction();
    await session.endSession();
    return { user, token };
  } catch (error) {
    // console.log({ error });

    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};
// const signIn = async (uid: string) => {
//   const user = await User.findOne({ uid }).populate([
//     {
//       path: 'showaUser',
//       options: { strictPopulate: false },
//     },
//     // // for no we no need wallet in this api; cause for get wallet we have another api
//     // {
//     //   path: 'wallet',
//     //   options: { strictPopulate: false },
//     // },
//   ]);
//   if (!user) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'no user founded with this uid');
//   }
//   const token = jwtFunc.generateToken(
//     user?.email as string,
//     user?._id.toString(),
//     user?.uid as string,
//   );

//   return { user, token };
// };
export const serviceProviderAdminServices = {
  createServiceProviderAdminIntoDB,
  //   signIn,
};

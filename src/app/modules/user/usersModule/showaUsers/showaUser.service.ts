import httpStatus from 'http-status';
import AppError from '../../../../errors/AppError';
import { Wallet } from '../../../wallet/wallet.model';
import { TUser } from '../../user.interface';
import { User } from '../../user.model';
import { TShowaUser } from './showaUser.interface';
import { ShowaUser } from './showaUser.model';
import { jwtFunc } from '../../../../utils/jwtFunction';
import mongoose from 'mongoose';

const createShowaUserIntoDB = async (
  rootUser: Partial<TUser>,
  showaUser: Partial<TShowaUser>,
) => {
  //create a user object
  // rootUser.role ='showa-user' // we no need to set it ; cause we have already set it as a default value in mongoose model
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

    showaUser.user = createdUser?._id;
    // showaUser.isDeleted= false // we no need to set it ; cause we have already set it as a default value in mongoose model
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
    const result = await User.findById(createdUser?._id).populate([
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
      updatedUser?.email as string,
      updatedUser?._id.toString(),
      updatedUser?.uid as string,
    );

    await session.commitTransaction();
    await session.endSession();
    return { user: result, token };
  } catch (error) {
    // console.log({ error });

    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

export const showaUserServices = {
  createShowaUserIntoDB,
};

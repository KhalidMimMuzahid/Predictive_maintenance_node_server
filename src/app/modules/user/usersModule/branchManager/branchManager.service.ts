import httpStatus from 'http-status';
import AppError from '../../../../errors/AppError';
import { TUser } from '../../user.interface';
import { User } from '../../user.model';
import {
  TCurrentStateForBranchManager,
  TServiceProviderBranchManager,
} from './branchManager.interface';
import mongoose, { Types } from 'mongoose';
import { ServiceProviderCompany } from '../../../serviceProviderCompany/serviceProviderCompany.model';
import { Wallet } from '../../../wallet/wallet.model';
import { ServiceProviderBranchManager } from './branchManager.model';
import { jwtFunc } from '../../../../utils/jwtFunction';

const createServiceProviderBranchManagerIntoDB = async ({
  serviceProviderCompany, // string of objectId; need to make it objectId first
  rootUser,
  serviceProviderBranchManager,
}: {
  serviceProviderCompany: string;
  rootUser: Partial<TUser>;
  serviceProviderBranchManager: TServiceProviderBranchManager;
}) => {
  //create a user object
  rootUser.role = 'serviceProviderBranchManager';
  // rootUser.isDeleted= false // we no need to set it ; cause we have already set it as a default value in mongoose model
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
  let serviceProviderCompany_id: Types.ObjectId;
  try {
    serviceProviderCompany_id = new Types.ObjectId(serviceProviderCompany);
  } catch (error) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'the company id you provided, is not correct',
    );
  }
  const serviceProviderCompanyData = await ServiceProviderCompany.findById(
    serviceProviderCompany_id,
  );
  if (!serviceProviderCompanyData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No Service Provider Company data found with the serviceProviderCompany._id',
    );
  }
  // creating the session
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // ----------------------------------------------------------------------------------

    const createdUserArray = await User.create([rootUser], {
      session: session,
    });
    if (!createdUserArray?.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
    }
    const createdUser = createdUserArray[0];

    const createdWalletArrayForUser = await Wallet.create(
      [
        {
          ownerType: 'user',
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

    if (!createdWalletArrayForUser?.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
    }
    const createdWalletForUser = createdWalletArrayForUser[0];

    serviceProviderBranchManager.user = createdUser?._id;

    const currentState: TCurrentStateForBranchManager = {
      status: 'in-progress',
      designation: 'Branch Manager',
      serviceProviderCompany: serviceProviderCompany_id,
      // joiningDate: ""
    };
    serviceProviderBranchManager.currentState = currentState;

    const createdServiceProviderBranchManagerArray =
      await ServiceProviderBranchManager.create(
        [serviceProviderBranchManager],
        {
          session: session,
        },
      );
    if (!createdServiceProviderBranchManagerArray?.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
    }

    const createdServiceProviderBranchManager =
      createdServiceProviderBranchManagerArray[0];

    const updatedUser = await User.findByIdAndUpdate(
      createdUser?._id,
      {
        wallet: createdWalletForUser?._id,
        serviceProviderBranchManager: createdServiceProviderBranchManager?._id,
      },
      { new: true, session: session },
    );
    if (!updatedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
    }

    // ----------------------------------------------------------------------------------

    await session.commitTransaction();
    await session.endSession();

    const user = await User.findById(createdUser?._id).populate([
      {
        path: 'serviceProviderBranchManager',
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

    return { user, token };
  } catch (error) {
    // console.log({ error });

    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

export const serviceProviderBranchManagerServices = {
  createServiceProviderBranchManagerIntoDB,
};

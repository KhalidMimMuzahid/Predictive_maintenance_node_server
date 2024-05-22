import httpStatus from 'http-status';
import AppError from '../../../../errors/AppError';
import { TUser } from '../../user.interface';
import { User } from '../../user.model';
import {
  TCurrentStateForEngineer,
  TServiceProviderEngineer,
} from './serviceProviderEngineer.interface';
import mongoose, { Types } from 'mongoose';
import { jwtFunc } from '../../../../utils/jwtFunction';
import { Wallet } from '../../../wallet/wallet.model';
import { ServiceProviderCompany } from '../../../serviceProviderCompany/serviceProviderCompany.model';
import { ServiceProviderEngineer } from './serviceProviderEngineer.model';
import { TAuth } from '../../../../interface/error';
import { ServiceProviderBranch } from '../../../serviceProviderBranch/serviceProviderBranch.model';

const createServiceProviderEngineerIntoDB = async ({
  serviceProviderCompany, // string of objectId; need to make it objectId first
  rootUser,
  serviceProviderEngineer,
}: {
  serviceProviderCompany: string;
  rootUser: Partial<TUser>;
  serviceProviderEngineer: TServiceProviderEngineer;
}) => {
  //create a user object
  rootUser.role = 'serviceProviderEngineer';
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
  const isPhoneExists = await User.isPhoneExists(rootUser?.phone as string);
  if (isPhoneExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'phone is already in use');
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

    serviceProviderEngineer.user = createdUser?._id;
    const currentState: TCurrentStateForEngineer = {
      status: 'in-progress',
      designation: 'Engineer',
      serviceProviderCompany: serviceProviderCompany_id,
      // joiningDate: ""
    };
    serviceProviderEngineer.currentState = currentState;

    const createdServiceProviderEngineerArray =
      await ServiceProviderEngineer.create([serviceProviderEngineer], {
        session: session,
      });
    if (!createdServiceProviderEngineerArray?.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
    }

    const createdServiceProviderEngineer =
      createdServiceProviderEngineerArray[0];

    const updatedUser = await User.findByIdAndUpdate(
      createdUser?._id,
      {
        wallet: createdWalletForUser?._id,
        serviceProviderEngineer: createdServiceProviderEngineer?._id,
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
        path: 'serviceProviderEngineer',
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
      user?.role as string,
    );

    return { user, token };
  } catch (error) {
    // console.log({ error });

    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const approveServiceProviderEngineerIntoDB = async (
  auth: TAuth,
  serviceProviderEngineer: string,
  serviceProviderBranch: string,
) => {
  let serviceProviderEngineer_id: Types.ObjectId;
  try {
    serviceProviderEngineer_id = new Types.ObjectId(serviceProviderEngineer);
  } catch (error) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      '_id of serviceProviderEngineer you provided is invalid',
    );
  }
  const serviceProviderEngineerData = await ServiceProviderEngineer.findById(
    serviceProviderEngineer_id,
  );

  if (!serviceProviderEngineerData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'serviceProviderEngineer must be provided to approved engineer',
    );
  } else if (
    serviceProviderEngineerData?.currentState?.status === 'suspended'
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'serviceProviderEngineer is suspended now',
    );
  } else if (
    serviceProviderEngineerData?.currentState?.status === 'approved' &&
    !serviceProviderBranch
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'serviceProviderEngineer ha already been approved',
    );
  } else if (serviceProviderEngineerData?.currentState?.serviceProviderBranch) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'serviceProviderEngineer has already ben approved and assigned in a branch',
    );
  }
  let companyInfo;

  if (auth.role === 'serviceProviderAdmin') {
    companyInfo = await ServiceProviderCompany.findOne({
      serviceProviderAdmin: auth._id,
    });
  } else if (auth.role === 'serviceProviderSubAdmin') {
    // if this request is requested by service provider sub admin, then any how find the companyInfo of this subAdmin
  }

  if (!companyInfo) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You are not admin of any company',
    );
  }

  if (
    serviceProviderEngineerData?.currentState?.serviceProviderCompany?.toString() !==
    companyInfo?._id?.toString()
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You are not admin/subAdmin of the company the engineer belongs to',
    );
  }

  if (serviceProviderBranch) {
    let serviceProviderBranch_id: Types.ObjectId;
    try {
      serviceProviderBranch_id = new Types.ObjectId(serviceProviderBranch);
    } catch (error) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        '_id of serviceProviderBranch you provided is invalid',
      );
    }

    const serviceProviderBranchInfo = await ServiceProviderBranch.findById(
      serviceProviderBranch_id,
    );

    if (
      serviceProviderBranchInfo?.serviceProviderCompany?.toString() !==
      serviceProviderEngineerData?.currentState?.serviceProviderCompany?.toString()
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        '_id of branch you provided is not a branch of your company',
      );
    }

    serviceProviderEngineerData.currentState.serviceProviderBranch =
      serviceProviderBranch_id;
  }
  serviceProviderEngineerData.currentState.status = 'approved';

  const updatedServiceProviderEngineerData =
    await serviceProviderEngineerData.save();
  return updatedServiceProviderEngineerData;
};

export const serviceProviderEngineerServices = {
  createServiceProviderEngineerIntoDB,
  approveServiceProviderEngineerIntoDB,
};

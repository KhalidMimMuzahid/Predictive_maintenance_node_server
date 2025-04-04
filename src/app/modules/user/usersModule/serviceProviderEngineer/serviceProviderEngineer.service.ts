import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import AppError from '../../../../errors/AppError';
import { TAuth } from '../../../../interface/error';
import { jwtFunc } from '../../../../utils/jwtFunction';
import { ServiceProviderBranch } from '../../../serviceProviderBranch/serviceProviderBranch.model';
import { ServiceProviderCompany } from '../../../serviceProviderCompany/serviceProviderCompany.model';
import { Wallet } from '../../../wallet/wallet.model';
import { TUser } from '../../user.interface';
import { User } from '../../user.model';
import {
  TCurrentStateForEngineer,
  TServiceProviderEngineer,
} from './serviceProviderEngineer.interface';
import { ServiceProviderEngineer } from './serviceProviderEngineer.model';
import { TInviteMember } from '../../../extraData/extraData.interface';
import { ExtraData } from '../../../extraData/extraData.model';

const createServiceProviderEngineerIntoDB = async ({
  serviceProviderCompany, // string of objectId; need to make it objectId first
  rootUser,
  serviceProviderEngineer,
  invitedMember,
}: {
  serviceProviderCompany: string;
  rootUser: Partial<TUser>;
  serviceProviderEngineer: TServiceProviderEngineer;
  invitedMember: string;
}) => {
  //create a user object
  rootUser.role = 'serviceProviderEngineer';
  rootUser.followings = [];
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

    // --------------------------------------------------------- --------

    let inviteMemberData: TInviteMember;
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    let serviceProviderBranchData: any;

    if (invitedMember) {
      const extraData = await ExtraData.findOne({
        _id: new mongoose.Types.ObjectId(invitedMember),
        type: 'inviteMember',
      });
      if (!extraData) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'invitedMember you provided has not found',
        );
      }
      inviteMemberData = extraData?.inviteMember;
      serviceProviderBranchData = await ServiceProviderBranch.findById(
        inviteMemberData?.serviceProviderEngineer?.serviceProviderBranch,
      );

      if (!serviceProviderBranchData) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'something went wrong, please try again',
        );
      }
    }

    // -------------------------------------------------------------------

    const currentState: TCurrentStateForEngineer = {
      status: inviteMemberData?.serviceProviderEngineer?.serviceProviderBranch
        ? 'approved'
        : 'in-progress',
      designation: 'Engineer',
      serviceProviderCompany: serviceProviderCompany_id,
      serviceProviderBranch: inviteMemberData?.serviceProviderEngineer
        ?.serviceProviderBranch
        ? serviceProviderBranchData?._id
        : undefined,
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

const editServiceProviderEngineer = async (
  auth: TAuth,
  serviceProviderEngineerId: string,
  updateData: Partial<TServiceProviderEngineer>,
) => {
  let serviceProviderEngineer_id: Types.ObjectId;
  try {
    serviceProviderEngineer_id = new Types.ObjectId(serviceProviderEngineerId);
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
      'No Engineer found with the provided ID',
    );
  }

  //Check if the user is authorized to edit this engineer
  const companyInfo = await ServiceProviderCompany.findOne({
    serviceProviderAdmin: auth._id,
  });

  if (!companyInfo) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You are not authorized to edit any company data',
    );
  }

  // Check if the engineer belongs to the same company as the admin
  if (
    serviceProviderEngineerData?.currentState?.serviceProviderCompany?.toString() !==
    companyInfo?._id?.toString()
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You are not authorized to edit this engineer’s data',
    );
  }

  Object.assign(serviceProviderEngineerData, updateData);

  const updatedServiceProviderEngineer =
    await serviceProviderEngineerData.save();

  return updatedServiceProviderEngineer;
};
const getAllServiceProviderEngineersByBranch = async (
  serviceProviderBranch: string,
) => {
  const result = await ServiceProviderEngineer.find({
    'currentState.serviceProviderBranch': new Types.ObjectId(
      serviceProviderBranch,
    ),
  });

  return result;
};
export const serviceProviderEngineerServices = {
  createServiceProviderEngineerIntoDB,
  approveServiceProviderEngineerIntoDB,
  editServiceProviderEngineer,
  getAllServiceProviderEngineersByBranch,
};

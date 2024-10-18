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
  TCurrentStateForBranchManager,
  TServiceProviderBranchManager,
} from './branchManager.interface';
import { ServiceProviderBranchManager } from './branchManager.model';
import { ExtraData } from '../../../extraData/extraData.model';
import { TInviteMember } from '../../../extraData/extraData.interface';

const createServiceProviderBranchManagerIntoDB = async ({
  serviceProviderCompany, // string of objectId; need to make it objectId first
  rootUser,
  serviceProviderBranchManager,
  invitedMember,
}: {
  serviceProviderCompany: string;
  rootUser: Partial<TUser>;
  serviceProviderBranchManager: TServiceProviderBranchManager;
  invitedMember: string;
}) => {
  //create a user object
  rootUser.role = 'serviceProviderBranchManager';
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

    serviceProviderBranchManager.user = createdUser?._id;
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
        inviteMemberData?.serviceProviderBranchManager?.serviceProviderBranch,
      );

      if (!serviceProviderBranchData) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'something went wrong, please try again',
        );
      }
    }

    const currentState: TCurrentStateForBranchManager = {
      status: inviteMemberData?.serviceProviderBranchManager
        ?.serviceProviderBranch
        ? 'approved'
        : 'in-progress',
      designation: 'Branch Manager',
      serviceProviderCompany: serviceProviderCompany_id,
      serviceProviderBranch: inviteMemberData?.serviceProviderBranchManager
        ?.serviceProviderBranch
        ? serviceProviderBranchData?._id
        : undefined,
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
const approveServiceProviderBranchManagerIntoDB = async (
  auth: TAuth,
  serviceProviderBranchManager: string,
  serviceProviderBranch: string,
) => {
  let serviceProviderBranchManager_id: Types.ObjectId;
  try {
    serviceProviderBranchManager_id = new Types.ObjectId(
      serviceProviderBranchManager,
    );
  } catch (error) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      '_id of serviceProviderBranchManager you provided is invalid',
    );
  }
  const serviceProviderBranchManagerData =
    await ServiceProviderBranchManager.findById(
      serviceProviderBranchManager_id,
    );

  if (!serviceProviderBranchManagerData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'serviceProviderBranchManager must be provided to approved Branch Manager',
    );
  } else if (
    serviceProviderBranchManagerData?.currentState?.status === 'suspended'
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'serviceProviderBranchManager is suspended now',
    );
  } else if (
    serviceProviderBranchManagerData?.currentState?.status === 'approved' &&
    !serviceProviderBranch
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'serviceProviderBranchManager ha already been approved',
    );
  } else if (
    serviceProviderBranchManagerData?.currentState?.serviceProviderBranch
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'serviceProviderBranchManager has already ben approved and assigned in a branch',
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
    serviceProviderBranchManagerData?.currentState?.serviceProviderCompany?.toString() !==
    companyInfo?._id?.toString()
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You are not admin/subAdmin of the company the branch manager belongs to',
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
      serviceProviderBranchManagerData?.currentState?.serviceProviderCompany?.toString()
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        '_id of branch you provided is not a branch of your company',
      );
    }
    const isExistsBranchManagerForThisBranch =
      await ServiceProviderBranchManager.findOne({
        'currentState.serviceProviderBranch': serviceProviderBranch_id,
      });
    if (isExistsBranchManagerForThisBranch) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'This branch already have a branch manager',
      );
    }
    serviceProviderBranchManagerData.currentState.serviceProviderBranch =
      serviceProviderBranch_id;
  }
  serviceProviderBranchManagerData.currentState.status = 'approved';

  const updatedServiceProviderBranchManagerData =
    await serviceProviderBranchManagerData.save();

  return updatedServiceProviderBranchManagerData;
};


// const editServiceProviderBranchManager = async (
//   auth: TAuth,
//   serviceProviderBranchManagerId: string,
//   updateData: Partial<TServiceProviderBranchManager>,
//   serviceProviderBranch?: string,
// ) => {
//   // Step 1: Validate serviceProviderBranchManagerId
//   let serviceProviderBranchManager_id: Types.ObjectId;
//   try {
//     serviceProviderBranchManager_id = new Types.ObjectId(
//       serviceProviderBranchManagerId,
//     );
//     console.log(serviceProviderBranchManagerId);
//   } catch (error) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       '_id of serviceProviderBranchManager you provided is invalid',
//     );
//   }

//   // Step 2: Find the ServiceProviderBranchManager by ID
//   const serviceProviderBranchManagerData =
//     await ServiceProviderBranchManager.findById(
//       serviceProviderBranchManager_id,
//     );

//   if (!serviceProviderBranchManagerData) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'No Branch Manager found with the provided ID',
//     );
//   }

//   // Step 3: Check if the user is authorized to edit this branch manager
//   const companyInfo = await ServiceProviderCompany.findOne({
//     serviceProviderAdmin: auth._id,
//   });

//   if (!companyInfo) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'You are not authorized to edit any company data',
//     );
//   }

//   // Check if the branch manager belongs to the same company as the admin
//   if (
//     serviceProviderBranchManagerData?.currentState?.serviceProviderCompany?.toString() !==
//     companyInfo?._id?.toString()
//   ) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'You are not authorized to edit this branch manager’s data',
//     );
//   }

//   // Step 4: Handle branch reassignment (if provided)
//   if (serviceProviderBranch) {
//     let serviceProviderBranch_id: Types.ObjectId;
//     try {
//       serviceProviderBranch_id = new Types.ObjectId(serviceProviderBranch);
//     } catch (error) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         '_id of serviceProviderBranch you provided is invalid',
//       );
//     }

//     const serviceProviderBranchInfo = await ServiceProviderBranch.findById(
//       serviceProviderBranch_id,
//     );

//     if (
//       serviceProviderBranchInfo?.serviceProviderCompany?.toString() !==
//       serviceProviderBranchManagerData?.currentState?.serviceProviderCompany?.toString()
//     ) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'This branch does not belong to the same company',
//       );
//     }

//     const isBranchManagerAssigned = await ServiceProviderBranchManager.findOne({
//       'currentState.serviceProviderBranch': serviceProviderBranch_id,
//     });

//     if (isBranchManagerAssigned) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'This branch already has a manager assigned',
//       );
//     }

//     // Update the serviceProviderBranchManager's branch
//     serviceProviderBranchManagerData.currentState.serviceProviderBranch =
//       serviceProviderBranch_id;
//   }

//   // Step 5: Update the branch manager's data
//   Object.assign(serviceProviderBranchManagerData, updateData);

//   // Step 6: Save the updated data
//   const updatedServiceProviderBranchManager =
//     await serviceProviderBranchManagerData.save();

//   return updatedServiceProviderBranchManager;
// };

// const editServiceProviderBranchManager = async (
//   auth: TAuth,
//   serviceProviderBranchManagerId: string,
//   updateData: Partial<TServiceProviderBranchManager>,
//   serviceProviderBranch?: string,
// ) => {
//   // Step 1: Validate serviceProviderBranchManagerId
//   let serviceProviderBranchManager_id: Types.ObjectId;
//   try {
//     serviceProviderBranchManager_id = new Types.ObjectId(
//       serviceProviderBranchManagerId,
//     );
//   } catch (error) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       '_id of serviceProviderBranchManager you provided is invalid',
//     );
//   }

//   // Step 2: Find the ServiceProviderBranchManager by ID
//   const serviceProviderBranchManagerData =
//     await ServiceProviderBranchManager.findById(
//       serviceProviderBranchManager_id,
//     );

//   if (!serviceProviderBranchManagerData) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'No Branch Manager found with the provided ID',
//     );
//   }

//   // Step 3: Check if the user is authorized to edit this branch manager
//   const companyInfo = await ServiceProviderCompany.findOne({
//     serviceProviderAdmin: auth._id,
//   });

//   if (!companyInfo) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'You are not authorized to edit any company data',
//     );
//   }

//   // Check if the branch manager belongs to the same company as the admin
//   if (
//     serviceProviderBranchManagerData.currentState.serviceProviderCompany.toString() !==
//     companyInfo._id.toString()
//   ) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'You are not authorized to edit this branch manager’s data',
//     );
//   }

//   // Step 4: Handle branch reassignment (if provided)
//   if (serviceProviderBranch) {
//     let serviceProviderBranch_id: Types.ObjectId;
//     try {
//       serviceProviderBranch_id = new Types.ObjectId(serviceProviderBranch);
//     } catch (error) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         '_id of serviceProviderBranch you provided is invalid',
//       );
//     }

//     const serviceProviderBranchInfo = await ServiceProviderBranch.findById(
//       serviceProviderBranch_id,
//     );

//     if (
//       serviceProviderBranchInfo.serviceProviderCompany.toString() !==
//       serviceProviderBranchManagerData.currentState.serviceProviderCompany.toString()
//     ) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'This branch does not belong to the same company',
//       );
//     }

//     const isBranchManagerAssigned = await ServiceProviderBranchManager.findOne({
//       'currentState.serviceProviderBranch': serviceProviderBranch_id,
//     });

//     if (isBranchManagerAssigned) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'This branch already has a manager assigned',
//       );
//     }

//     // Update the serviceProviderBranchManager's branch
//     serviceProviderBranchManagerData.currentState.serviceProviderBranch =
//       serviceProviderBranch_id;
//   }

//   // Step 5: Update the branch manager's data
//   Object.assign(serviceProviderBranchManagerData, updateData);

//   // Step 6: Save the updated data
//   const updatedServiceProviderBranchManager =
//     await serviceProviderBranchManagerData.save();

//   return updatedServiceProviderBranchManager;
// };

const editServiceProviderBranchManager = async (
  auth: TAuth,
  serviceProviderBranchManagerId: string,
  updateData: Partial<TServiceProviderBranchManager>,
) => {
  let serviceProviderBranchManager_id: Types.ObjectId;
  try {
    serviceProviderBranchManager_id = new Types.ObjectId(
      serviceProviderBranchManagerId,
    );
  } catch (error) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      '_id of serviceProviderBranchManager you provided is invalid',
    );
  }

  const serviceProviderBranchManagerData =
    await ServiceProviderBranchManager.findById(
      serviceProviderBranchManager_id,
    );

  if (!serviceProviderBranchManagerData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No Branch Manager found with the provided ID',
    );
  }

  const companyInfo = await ServiceProviderCompany.findOne({
    serviceProviderAdmin: auth._id,
  });

  if (!companyInfo) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You are not authorized to edit any company data',
    );
  }

  if (
    serviceProviderBranchManagerData?.currentState?.serviceProviderCompany?.toString() !==
    companyInfo?._id?.toString()
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You are not authorized to edit this branch manager’s data',
    );
  }

  Object.assign(serviceProviderBranchManagerData, updateData);

  const updatedServiceProviderBranchManager =
    await serviceProviderBranchManagerData.save();

  return updatedServiceProviderBranchManager;
};

export const serviceProviderBranchManagerServices = {
  createServiceProviderBranchManagerIntoDB,
  approveServiceProviderBranchManagerIntoDB,
  editServiceProviderBranchManager,
};

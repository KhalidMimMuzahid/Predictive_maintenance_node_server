import mongoose from 'mongoose';
import { TUser } from '../../user.interface';
import { TServiceProviderAdmin } from './serviceProviderAdmin.interface';
import { User } from '../../user.model';
import AppError from '../../../../errors/AppError';
import httpStatus from 'http-status';
import { TServiceProviderCompany } from '../../../serviceProviderCompany/serviceProviderCompany.interface';
import { jwtFunc } from '../../../../utils/jwtFunction';
import { createServiceProviderCompanyAndAdmin } from './serviceProviderAdmin.utils';
import { createServiceProviderBranch } from '../../../serviceProviderBranch/serviceProviderBranch.utils';
import { TServiceProviderBranch } from '../../../serviceProviderBranch/serviceProviderBranch.interface';

const createServiceProviderAdminIntoDB = async (
  rootUser: Partial<TUser>,
  serviceProviderAdmin: Partial<TServiceProviderAdmin>,
  serviceProviderCompany: Partial<TServiceProviderCompany>,
  serviceProviderBranch: Partial<TServiceProviderBranch>,
) => {
  //create a user object
  rootUser.role = 'serviceProviderAdmin';
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

  // creating the session
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { createdUser, updatedServiceProviderCompany } =
      await createServiceProviderCompanyAndAdmin({
        session,
        rootUser,
        serviceProviderAdmin,
        serviceProviderCompany,
      });

    // if serviceProviderAdmin wants to create branch
    if (serviceProviderBranch) {
      await createServiceProviderBranch({
        session,
        serviceProviderCompany: updatedServiceProviderCompany?._id,
        serviceProviderBranch,
      });
    }

    await session.commitTransaction();
    await session.endSession();

    const user = await User.findById(createdUser?._id).populate([
      {
        path: 'serviceProviderAdmin',
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

export const serviceProviderAdminServices = {
  createServiceProviderAdminIntoDB,
};

import { createServiceProviderBranch } from './serviceProviderBranch.utils';
import mongoose from 'mongoose';
import { TServiceProviderBranch } from './serviceProviderBranch.interface';
import { userServices } from '../user/user.service';

import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
// import { TServiceProviderAdmin } from '../user/usersModule/serviceProviderAdmin/serviceProviderAdmin.interface';

const createServiceProviderBranchInToDB = async ({
  user,
  serviceProviderBranch,
}: {
  user: mongoose.Types.ObjectId;
  serviceProviderBranch: Partial<TServiceProviderBranch>;
}) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const userData = await userServices.getUserBy_id(
      user?.toString() as string,
    );

    if (!userData[`${userData?.role}`].serviceProviderCompany) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }
    const serviceProviderCompany =
      userData[`${userData?.role}`].serviceProviderCompany;

    const createdServiceProviderBranch = await createServiceProviderBranch({
      session,
      serviceProviderCompany,
      serviceProviderBranch,
    });

    await session.commitTransaction();
    await session.endSession();

    return createdServiceProviderBranch;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

export const serviceProviderBranchServices = {
  createServiceProviderBranchInToDB,
};

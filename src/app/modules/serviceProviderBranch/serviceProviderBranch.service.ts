import { createServiceProviderBranch } from './serviceProviderBranch.utils';
import mongoose from 'mongoose';
import { TServiceProviderBranch } from './serviceProviderBranch.interface';
import { userServices } from '../user/user.service';

import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { ServiceProviderBranch } from './serviceProviderBranch.model';
import { TAddress } from '../common/common.interface';
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

    const userData = await userServices.getUserBy_id({
      _id: user?.toString() as string,
    });

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
const updateAddress = async ({
  document_id,
  address,
}: {
  document_id: string;
  address: TAddress;
}) => {
  const previousBranch = await ServiceProviderBranch.findById(document_id);

  const updateDocument: Partial<TAddress> = previousBranch?.address || {};
  if (address?.buildingName) {
    updateDocument['buildingName'] = address?.buildingName;
  }
  if (address?.city) {
    updateDocument['city'] = address?.city;
  }
  if (address?.country) {
    updateDocument['country'] = address?.country;
  }

  if (address?.details) {
    updateDocument['details'] = address?.details;
  }
  if (address?.googleString) {
    updateDocument['googleString'] = address?.googleString;
  }
  if (address?.location) {
    updateDocument['location'] = address?.location;
  }
  if (address?.postalCode) {
    updateDocument['postalCode'] = address?.postalCode;
  }
  if (address?.prefecture) {
    updateDocument['prefecture'] = address?.prefecture;
  }
  if (address?.roomNumber) {
    updateDocument['roomNumber'] = address?.roomNumber;
  }
  if (address?.state) {
    updateDocument['state'] = address?.state;
  }
  if (address?.street) {
    updateDocument['street'] = address?.street;
  }
  // previousMachine.usedFor.address = updateDocument;
  const result = await ServiceProviderBranch.findByIdAndUpdate(
    document_id,
    {
      address: updateDocument,
    },
    { new: true },
  );

  return result;
};

export const serviceProviderBranchServices = {
  createServiceProviderBranchInToDB,
  updateAddress,
};

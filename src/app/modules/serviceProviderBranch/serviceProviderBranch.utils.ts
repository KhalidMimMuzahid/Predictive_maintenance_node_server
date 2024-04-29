// if (!createdUserArray?.length) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
//   }

import mongoose, { Types } from 'mongoose';
import { TServiceProviderBranch } from './serviceProviderBranch.interface';
import { ServiceProviderBranch } from './serviceProviderBranch.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { Wallet } from '../wallet/wallet.model';
import { ServiceProviderCompany } from '../serviceProviderCompany/serviceProviderCompany.model';

export const createServiceProviderBranch = async ({
  session,
  serviceProviderCompany,
  serviceProviderBranch,
}: {
  session: mongoose.mongo.ClientSession;
  serviceProviderCompany: Types.ObjectId;
  serviceProviderBranch: Partial<TServiceProviderBranch>;
}) => {
  serviceProviderBranch.serviceProviderCompany = serviceProviderCompany;
  serviceProviderBranch.status = 'success';
  serviceProviderBranch.type = 'branch';

  const createdServiceProviderBranchArray = await ServiceProviderBranch.create(
    [serviceProviderBranch],
    {
      session: session,
    },
  );
  if (!createdServiceProviderBranchArray?.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'failed to create service provider branch',
    );
  }
  const createdServiceProviderBranch = createdServiceProviderBranchArray[0];

  const createdWalletArrayForServiceProviderBranch = await Wallet.create(
    [
      {
        ownerType: 'serviceProviderBranch',
        serviceProviderBranch: createdServiceProviderBranch?._id,
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

  if (!createdWalletArrayForServiceProviderBranch?.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'failed to create service provider branch',
    );
  }

  const createdWalletForServiceProviderBranch =
    createdWalletArrayForServiceProviderBranch[0];

  const updatedServiceProviderBranch =
    await ServiceProviderBranch.findByIdAndUpdate(
      createdServiceProviderBranch?._id,
      {
        wallet: createdWalletForServiceProviderBranch?._id,
      },
      { new: true, session: session },
    );
  // console.log({ updatedServiceProviderBranch });
  if (!updatedServiceProviderBranch) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'failed to create service provider branch',
    );
  }

  const updatedServiceProviderCompany =
    await ServiceProviderCompany.findByIdAndUpdate(
      serviceProviderCompany,
      {
        $addToSet: { branches: createdServiceProviderBranch?._id },
      },
      { new: true, session: session },
    );
  if (!updatedServiceProviderCompany) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'failed to create service provider branch',
    );
  }
  return updatedServiceProviderBranch;
};

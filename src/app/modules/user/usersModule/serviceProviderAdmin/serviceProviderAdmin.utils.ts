import mongoose from 'mongoose';
import { TUser } from '../../user.interface';
import { TServiceProviderAdmin } from './serviceProviderAdmin.interface';
import { TServiceProviderCompany } from '../../../serviceProviderCompany/serviceProviderCompany.interface';
import { User } from '../../user.model';
import AppError from '../../../../errors/AppError';
import httpStatus from 'http-status';
import { Wallet } from '../../../wallet/wallet.model';
import { ServiceProviderAdmin } from './serviceProviderAdmin.model';
import { ServiceProviderCompany } from '../../../serviceProviderCompany/serviceProviderCompany.model';

export const createServiceProviderCompanyAndAdmin = async ({
  session,
  rootUser,
  serviceProviderAdmin,
  serviceProviderCompany,
}: {
  session: mongoose.mongo.ClientSession;
  rootUser: Partial<TUser>;
  serviceProviderAdmin: Partial<TServiceProviderAdmin>;
  serviceProviderCompany: Partial<TServiceProviderCompany>;
}) => {
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

  serviceProviderAdmin.user = createdUser?._id;
  // serviceProviderAdmin.isDeleted= false // we no need to set it ; cause we have already set it as a default value in mongoose model
  const createdServiceProviderAdminArray = await ServiceProviderAdmin.create(
    [serviceProviderAdmin],
    {
      session: session,
    },
  );
  if (!createdServiceProviderAdminArray?.length) {
    throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
  }

  const createdServiceProviderAdmin = createdServiceProviderAdminArray[0];
createdUser.wallet = createdWalletForUser?._id;
createdUser.serviceProviderAdmin = createdServiceProviderAdmin?._id;
const updatedUser = await createdUser.save({ session });

// const updatedUser = await User.findByIdAndUpdate(
//     createdUser?._id,
//     {
//       wallet: createdWalletForUser?._id,
//       serviceProviderAdmin: createdServiceProviderAdmin?._id,
//     },
//     { new: true, session: session },
//   );

if (!updatedUser) {
  throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
}

serviceProviderCompany.serviceProviderAdmin = createdUser?._id;
serviceProviderCompany.status = 'success';

const createdServiceProviderCompanyArray = await ServiceProviderCompany.create(
  [serviceProviderCompany],
  {
    session: session,
  },
);
if (!createdServiceProviderCompanyArray?.length) {
  throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
}
const createdServiceProviderCompany = createdServiceProviderCompanyArray[0];

console.log('problem: ', createdServiceProviderCompany);


  createdServiceProviderAdmin.serviceProviderCompany =
    createdServiceProviderCompany?._id;
  const updatedServiceProviderAdmin = createdServiceProviderAdmin.save({
    session: session,
  });
  if (!updatedServiceProviderAdmin) {
    throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
  }
  const createdWalletArrayForServiceProviderCompany = await Wallet.create(
    [
      {
        ownerType: 'serviceProviderCompany',
        serviceProviderCompany: createdServiceProviderCompany?._id,
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

  if (!createdWalletArrayForServiceProviderCompany?.length) {
    throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
  }

  const createdWalletForServiceProviderCompany =
    createdWalletArrayForServiceProviderCompany[0];

  const updatedServiceProviderCompany =
    await ServiceProviderCompany.findByIdAndUpdate(
      createdServiceProviderCompany?._id,
      {
        wallet: createdWalletForServiceProviderCompany?._id,
        serviceProviderAdmin: createdUser?._id,
      },
      { new: true, session: session },
    );

  if (!updatedServiceProviderCompany) {
    throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
  }

  return { createdUser, updatedServiceProviderCompany };
};

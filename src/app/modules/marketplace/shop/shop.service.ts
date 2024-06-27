import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { TAuth } from '../../../interface/error';
import { ServiceProviderCompany } from '../../serviceProviderCompany/serviceProviderCompany.model';
import { TShop } from './shop.interface';
import Shop from './shop.model';
import { ServiceProviderAdmin } from '../../user/usersModule/serviceProviderAdmin/serviceProviderAdmin.model';
import mongoose from 'mongoose';

const createShop = async ({
  auth,
  shop,
}: {
  auth: TAuth;
  shop: Partial<TShop>;
}) => {
  const serviceProviderCompany = await ServiceProviderCompany.findOne({
    serviceProviderAdmin: auth?._id,
  });
  if (!serviceProviderCompany) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'something went wrong, please try again',
    );
  }
  shop.serviceProviderAdmin = auth?._id;
  shop.ownedBy = 'serviceProviderCompany';
  shop.status = 'success';
  shop.serviceProviderCompany = serviceProviderCompany?._id;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const createdShopArray = await Shop.create([shop], { session });

    if (!createdShopArray?.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }

    const createdShop = createdShopArray[0];
    const updatedServiceProviderAdmin =
      await ServiceProviderAdmin.findOneAndUpdate(
        { user: auth?._id },
        { shop: createdShop?._id },
        { session },
      );

    if (!updatedServiceProviderAdmin) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }

    await session.commitTransaction();
    await session.endSession();
    return createdShop;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

export const shopServices = {
  createShop,
};

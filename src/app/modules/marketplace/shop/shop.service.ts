import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../../errors/AppError';
import { TAuth } from '../../../interface/error';
import { ServiceProviderCompany } from '../../serviceProviderCompany/serviceProviderCompany.model';
import { ServiceProviderAdmin } from '../../user/usersModule/serviceProviderAdmin/serviceProviderAdmin.model';
import Order from '../order/order.model';
import Product from '../product/product.model';
import { TShop } from './shop.interface';
import Shop from './shop.model';

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

const getShopDashboard = async ({ shopId }: { shopId: string }) => {
  const shopObjectId = new mongoose.Types.ObjectId(shopId);

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0,
    0,
  );
  const todayEnd = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
    999,
  );

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  const sevenDaysAgoStart = new Date(
    sevenDaysAgo.getFullYear(),
    sevenDaysAgo.getMonth(),
    sevenDaysAgo.getDate(),
    0,
    0,
    0,
    0,
  );

  const todaysSales = await Order.aggregate([
    {
      $match: {
        shop: shopObjectId,
        paidStatus: { isPaid: true },
        createdAt: { $gte: todayStart, $lt: todayEnd },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$cost.totalAmount' },
      },
    },
  ]);

  const todaysUnits = await Order.aggregate([
    {
      $match: {
        shop: shopObjectId,
        paidStatus: { isPaid: true },
        createdAt: { $gte: todayStart, $lt: todayEnd },
      },
    },
    {
      $group: {
        _id: null,
        totalUnits: { $sum: '$cost.quantity' },
      },
    },
  ]);

  const activeCustomers = await Order.aggregate([
    {
      $match: {
        shop: shopObjectId,
        paidStatus: { isPaid: true },
        createdAt: { $gte: todayStart, $lt: todayEnd },
      },
    },
    {
      $group: {
        _id: '$user',
      },
    },
    {
      $count: 'totalActiveCustomers',
    },
  ]);

  const newCustomers = await Order.aggregate([
    {
      $match: {
        shop: shopObjectId,
        paidStatus: { isPaid: true },
        createdAt: { $gte: sevenDaysAgoStart, $lt: todayEnd },
      },
    },
    {
      $group: {
        _id: '$user',
        firstPurchaseDate: { $min: '$createdAt' },
      },
    },
    {
      $match: {
        firstPurchaseDate: { $gte: sevenDaysAgoStart },
      },
    },
    {
      $count: 'totalNewCustomers',
    },
  ]);

  const totalProducts = await Product.countDocuments({
    shop: shopObjectId,
  });

  const totalSales = await Order.aggregate([
    {
      $match: {
        shop: shopObjectId,
        paidStatus: { isPaid: true },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$cost.totalAmount' },
      },
    },
  ]);

  const totalSalesLastSevenDays = await Order.aggregate([
    {
      $match: {
        shop: shopObjectId,
        paidStatus: { isPaid: true },
        createdAt: { $gte: sevenDaysAgoStart, $lt: todayEnd },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$cost.totalAmount' },
      },
    },
  ]);

  return {
    todaysSales: {
      totalSales: todaysSales[0]?.totalSales || 0,
    },
    todaysUnits: {
      totalUnits: todaysUnits[0]?.totalUnits || 0,
    },
    totalActiveCustomers: activeCustomers[0]?.totalActiveCustomers || 0,
    totalNewCustomers: newCustomers[0]?.totalNewCustomers || 0,
    totalProducts,
    totalSales: totalSales[0]?.totalSales || 0,
    totalSalesLastSevenDays: totalSalesLastSevenDays[0]?.totalSales || 0,
  };
};

export const shopServices = {
  createShop,
  getShopDashboard,
};

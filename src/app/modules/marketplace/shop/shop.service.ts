import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../../errors/AppError';
import { TAuth } from '../../../interface/error';
import { addDays } from '../../../utils/addDays';
import { ServiceProviderCompany } from '../../serviceProviderCompany/serviceProviderCompany.model';
import { ServiceProviderAdmin } from '../../user/usersModule/serviceProviderAdmin/serviceProviderAdmin.model';
import Order from '../order/order.model';
import Product from '../product/product.model';
import { TShop } from './shop.interface';
import Shop from './shop.model';
import { Wallet } from '../../wallet/wallet.model';

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
    const createdWalletArrayForShop = await Wallet.create(
      [
        {
          ownerType: 'shop',
          shop: createdShop?._id,
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

    if (!createdWalletArrayForShop?.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to create shop');
    }

    const createdWalletForShop = createdWalletArrayForShop[0];
    createdShop.wallet = createdWalletForShop?._id;

    const updatedShop = await createdShop.save({ session });
    if (!updatedShop) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }
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
  today.setHours(0, 0, 0, 0);

  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const sevenDaysAgoStart = new Date(today);
  sevenDaysAgoStart.setDate(today.getDate() - 7);
  const todaysSales = await Order.aggregate([
    {
      $match: {
        shop: shopObjectId,
        paidStatus: { isPaid: true },
        createdAt: { $gte: today, $lt: todayEnd },
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
        //paidStatus: { isPaid: true },
        createdAt: { $gte: today, $lt: todayEnd },
        status: { $ne: 'canceled' },
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

        createdAt: { $gte: today, $lt: todayEnd },
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
        createdAt: { $gte: addDays(-7), $lt: todayEnd },
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
  };
};

const getProductSalesForGraph = async ({ shopId }: { shopId: string }) => {
  try {
    const shopObjectId = new mongoose.Types.ObjectId(shopId);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayEnd = new Date(today);
    todayEnd.setUTCHours(23, 59, 59, 999);

    const sevenDaysAgoStart = new Date(today);
    sevenDaysAgoStart.setUTCDate(today.getUTCDate() - 6);

    const productSalesLastSevenDays = await Order.aggregate([
      {
        $match: {
          shop: shopObjectId,
          paidStatus: { isPaid: true },
          createdAt: { $gte: sevenDaysAgoStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: {
            day: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
                timezone: 'UTC',
              },
            },
          },
          totalSales: { $sum: '$cost.totalAmount' },
        },
      },
      {
        $sort: { '_id.day': 1 },
      },
      {
        $project: {
          day: '$_id.day',
          totalSales: 1,
          _id: 0,
        },
      },
    ]);

    const salesByDay = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() - index);

      const formattedDate = date.toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
      const dayString = date.toLocaleDateString('en-US', { weekday: 'long' }); // Get day name
      const daySales = productSalesLastSevenDays.find(
        (sale) => sale.day === formattedDate,
      );

      return {
        day: dayString,
        totalSales: daySales ? daySales.totalSales : 0,
      };
    });

    return {
      success: true,
      message: 'Get product sales for graph',
      data: {
        productSalesLastSevenDays: salesByDay.reverse(),
      },
    };
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to retrieve product sales',
    );
  }
};

export const shopServices = {
  createShop,
  getShopDashboard,
  getProductSalesForGraph,
};

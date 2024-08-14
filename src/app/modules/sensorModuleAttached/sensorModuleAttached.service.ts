import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { SensorModule } from '../sensorModule/sensorModule.model';
import {
  TModule,
  TSensorModuleAttached,
} from './sensorModuleAttached.interface';
import { SensorModuleAttached } from './sensorModuleAttached.model';
import { validateSensorData } from './sensorModuleAttached.utils';
import { Request } from 'express';
import mongoose from 'mongoose';
import { SubscriptionPurchased } from '../subscriptionPurchased/subscriptionPurchased.model';
import { TSubscriptionPurchased } from '../subscriptionPurchased/subscriptionPurchased.interface';

const addSensorAttachedModuleIntoDB = async ({
  macAddress,
  subscriptionPurchased,
  sensorModuleAttached,
}: {
  macAddress: string;
  subscriptionPurchased: string;
  sensorModuleAttached: Partial<TSensorModuleAttached>;
}) => {
  // ------------------- XXXX ------------ checking subscription start
  const subscriptionPurchasedData = await SubscriptionPurchased.findOne({
    _id: new mongoose.Types.ObjectId(subscriptionPurchased),
    user: sensorModuleAttached.user,
  }).select('isActive usage expDate');

  if (!subscriptionPurchasedData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'subscriptionPurchased you provided is found as you purchased it yet',
    );
  }

  if (!subscriptionPurchasedData?.isActive) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'your subscription has expired, please renew your subscription',
    );
  }
  if (!subscriptionPurchasedData?.usage?.showaUser?.totalAvailableIOT) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already used your all available IOT. Please purchase a new subscription',
    );
  }
  // ------------------- XXXX ----------------checking subscription end
  const sensorModule = await SensorModule.findOne({ macAddress });
  if (!sensorModule) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no sensor module has found with this macAddress',
    );
  }
  if (sensorModule?.status === 'sold-out') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'this sensor module has already been sold out with this macAddress',
    );
  }

  sensorModuleAttached.sensorModule = sensorModule._id;
  sensorModuleAttached.macAddress = macAddress;

  sensorModuleAttached.isSwitchedOn = false;
  sensorModuleAttached.moduleType = sensorModule?.moduleType;

  sensorModule.status = 'sold-out';

  sensorModuleAttached.subscriptionPurchased = subscriptionPurchasedData?._id;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const updatedSensorModule = await sensorModule.save({ session });

    if (!updatedSensorModule) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not purchase sensor module',
      );
    }

    const createdSensorModuleAttachedArray = await SensorModuleAttached.create(
      [sensorModuleAttached],
      { session },
    );
    if (!createdSensorModuleAttachedArray?.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not purchase sensor module',
      );
    }

    const createdSensorModuleAttached = createdSensorModuleAttachedArray[0];

    subscriptionPurchasedData.usage.showaUser.IOTs.push(
      createdSensorModuleAttached?._id,
    );

    subscriptionPurchasedData.usage.showaUser.totalAvailableIOT -= 1;

    const updatedSubscriptionPurchasedData =
      await subscriptionPurchasedData.save({ session });

    if (!updatedSubscriptionPurchasedData) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Could not purchase sensor module, please try again',
      );
    }
    await session.commitTransaction();
    await session.endSession();

    return createdSensorModuleAttached;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const addSensorDataInToDB = async ({
  macAddress,
  sensorData,
  req,
}: {
  macAddress: string;
  sensorData: TModule;
  req: Request;
}) => {
  const sensorModuleAttached = await SensorModuleAttached.findOne({
    macAddress,
  })
    .select('subscriptionPurchased moduleType')
    .populate({
      path: 'subscriptionPurchased',
      select: 'isActive',
      options: { strictPopulate: false },
    });

  if (!sensorModuleAttached) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no sensor module has found with this macAddress',
    );
  }
  const subscriptionPurchased =
    sensorModuleAttached?.subscriptionPurchased as unknown as TSubscriptionPurchased;
  if (!subscriptionPurchased?.isActive) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Your subscription has expired for this machine, please renew your subscription',
    );
  }

  // we are validating sensor data here according to its module type
  const isValid = await validateSensorData({
    moduleType: sensorModuleAttached?.moduleType,
    sensorData: sensorData,
  });

  if (!isValid) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'sensor data is not valid according to its module type',
    );
  }

  const now = new Date(Date.now());

  await SensorModuleAttached.findOneAndUpdate(
    {
      macAddress,
    },
    { $push: { sensorData: sensorData } },
    { new: false },
  );

  req.io.emit(macAddress.toLowerCase(), { ...sensorData, createdAt: now });

  return null;
};

const getAttachedSensorModulesByuser = async (
  userId: mongoose.Types.ObjectId,
) => {
  const sensors = await SensorModuleAttached.find({ user: userId })
    .select(
      'sensorModule isAttached machine macAddress user purpose sectionName isSwitchedOn currentSubscription moduleType',
    )
    .populate('machine');
  return sensors;
};

const getAttachedSensorModulesByMachine = async (
  machine_id: mongoose.Types.ObjectId,
) => {
  const sensors = await SensorModuleAttached.find(
    { machine: machine_id },
    { sensorData: { $slice: [-10, 10] } },
  );
  return sensors;
};
const getAllAttachedSensorModulesByMachine = async (
  machine_id: mongoose.Types.ObjectId,
) => {
  const sensors = await SensorModuleAttached.find(
    { machine: machine_id },
    { sensorData: 0 },
  );
  return sensors;
};

const getSensorDataFromDB = async ({
  macAddress,
  page,
  limit,
}: {
  macAddress: string;
  page: number;
  limit: number;
}) => {
  // we must check the user role here, if it is customer then we need to check subscription validation; if it is admin then we may skip this part

  const sensorModuleAttachedData = await SensorModuleAttached.findOne({
    macAddress,
  })
    .select('subscriptionPurchased')
    .populate({
      path: 'subscriptionPurchased',
      select: 'isActive',
      options: { strictPopulate: false },
    });

  const subscriptionPurchased =
    sensorModuleAttachedData?.subscriptionPurchased as unknown as TSubscriptionPurchased;
  if (!subscriptionPurchased?.isActive) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Your subscription has expired for this machine, please renew your subscription',
    );
  }

  const result = await SensorModuleAttached.aggregate([
    { $match: { macAddress: macAddress } },
    {
      $project: {
        count: {
          $size: '$sensorData',
        },
      },
    },
  ]);

  if (result?.length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No attached sensor module available with this macAddress!',
    );
  }

  const dataCount = result.length > 0 ? result[0].count : 0;

  const remaining = dataCount - page * limit;
  let skip = -limit * page;
  let limitTemp = limit;
  if (remaining < 0) {
    skip = -dataCount;
    limitTemp = remaining + limit;
    if (limitTemp < 0) limitTemp = 0;
  }

  if (limitTemp === 0) {
    return {
      prevPage:
        limitTemp <= 0
          ? Math.ceil(dataCount / limit)
          : page - 1 == 0
            ? false
            : page - 1,

      nextPage: false,
      sensorData: [],
    };
  }
  const sensorModuleAttached = await SensorModuleAttached.findOne(
    { macAddress: macAddress },
    { sensorData: { $slice: [skip, limitTemp] } },
  );
  if (!sensorModuleAttached) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `No sensor data for this page ${page}`,
    );
  }

  const sensor = {
    prevPage:
      limitTemp <= 0
        ? Math.ceil(dataCount / limit)
        : page - 1 == 0
          ? false
          : page - 1,
    nextPage: page == Math.ceil(dataCount / limit) ? false : page + 1,
    sensorData: sensorModuleAttached?.sensorData || [],
    finished: true,
    sensorModule_id: sensorModuleAttached.sensorModule,

    macAddress,
    // price: iot.price,
    // status: iot.status,
    // uid: iot.uid,
    purpose: sensorModuleAttached.purpose,
    sectionName: sensorModuleAttached.sectionName,
    isSwitchedOn: sensorModuleAttached.isSwitchedOn,
    moduleType: sensorModuleAttached.moduleType,
    machine_id: sensorModuleAttached.machine,
  };

  return { totalData: sensor?.sensorData?.length || 0, ...sensor };
};
const getSensorModuleAttachedByMacAddress = async (macAddress: string) => {
  const sensorModuleAttached = await SensorModuleAttached.findOne(
    {
      macAddress: macAddress,
    },
    { sensorData: 0 },
  );
  return sensorModuleAttached;
};
export const sensorAttachedModuleServices = {
  addSensorAttachedModuleIntoDB,
  addSensorDataInToDB,
  getAttachedSensorModulesByuser,
  getAttachedSensorModulesByMachine,
  getAllAttachedSensorModulesByMachine,
  getSensorDataFromDB,
  getSensorModuleAttachedByMacAddress,
};

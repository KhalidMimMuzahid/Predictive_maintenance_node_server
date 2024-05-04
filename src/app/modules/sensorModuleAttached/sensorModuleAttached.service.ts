import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { SensorModule } from '../sensorModule/sensorModule.model';
import {
  TModule,
  TSensorModuleAttached,
} from './sensorModuleAttached.interface';
import { SensorModuleAttached } from './sensorModuleAttached.model';
import { validateSensorData } from './sensorModuleAttached.utils';
import { Types } from 'mongoose';

const addSensorAttachedModuleIntoDB = async (
  macAddress: string,
  sensorModuleAttached: Partial<TSensorModuleAttached>,
) => {
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
  const updatedSensorModule = await sensorModule.save();

  if (!updatedSensorModule) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'could not purchase sensor module',
    );
  }

  const createdSensorModuleAttached =
    await SensorModuleAttached.create(sensorModuleAttached);
  if (!createdSensorModuleAttached) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'could not purchase sensor module',
    );
  }
  return createdSensorModuleAttached;
};

const addSensorDataInToDB = async ({
  macAddress,
  sensorData,
}: {
  macAddress: string;
  sensorData: TModule;
}) => {
  const sensorModuleAttached = await SensorModuleAttached.findOne(
    {
      macAddress,
    },
    { moduleType: 1 },
  );

  if (!sensorModuleAttached) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no sensor module has found with this macAddress',
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

  await SensorModuleAttached.findOneAndUpdate(
    {
      macAddress,
    },
    { $push: { sensorData: sensorData } },
    { new: false },
  );

  return sensorData;
};

const getAttachedSensorModulesByuser = async (userId: Types.ObjectId) => {
  const sensors = await SensorModuleAttached.find({ user: userId })
    .select(
      'sensorModule isAttached machine macAddress user purpose sectionName isSwitchedOn currentSubscription moduleType',
    )
    .populate('machine');
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

export const sensorAttachedModuleServices = {
  addSensorAttachedModuleIntoDB,
  addSensorDataInToDB,
  getAttachedSensorModulesByuser,
  // addSensorDataInToDB
  getSensorDataFromDB,
};

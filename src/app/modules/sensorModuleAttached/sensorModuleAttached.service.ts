import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { SensorModule } from '../sensorModule/sensorModule.model';
import {
  TModule,
  TSensorModuleAttached,
} from './sensorModuleAttached.interface';
import { SensorModuleAttached } from './sensorModuleAttached.model';
import { validateSensorData } from './sensorModuleAttached.utils';

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
export const sensorAttachedModuleServices = {
  addSensorAttachedModuleIntoDB,
  addSensorDataInToDB,
};

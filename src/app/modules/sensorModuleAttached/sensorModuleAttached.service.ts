import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { SensorModule } from '../sensorModule/sensorModule.model';
import { TSensorModuleAttached } from './sensorModuleAttached.interface';
import { SensorModuleAttached } from './sensorModuleAttached.model';

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
export const sensorAttachedModuleServices = {
  addSensorAttachedModuleIntoDB,
};

import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TSensorModule } from './sensorModule.interface';
import { SensorModule } from './sensorModule.model';

const addSensorModuleIntoDB = async (sensorModule: TSensorModule) => {
  const isMacAddressExists = await SensorModule.isMacAddressExists(
    sensorModule?.macAddress,
  );

  if (isMacAddressExists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'MacAddress has already in used',
    );
  }
  sensorModule.status = 'in-stock';
  const createdSensorModule = await SensorModule.create(sensorModule);

  return createdSensorModule;
};
const getAllSensorModules = async () => {
  const sensors = await SensorModule.find({ status: 'in-stock' });
  return sensors;
};
export const sensorModuleServices = {
  addSensorModuleIntoDB,
  getAllSensorModules,
};

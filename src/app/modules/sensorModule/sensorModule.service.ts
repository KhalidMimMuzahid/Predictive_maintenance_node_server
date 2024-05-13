import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TSensorModule, TStatus } from './sensorModule.interface';
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
const getAllSensorModules = async (status: TStatus) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterQuery: any = {};
  if (status) filterQuery['status'] = status;
  const sensors = await SensorModule.find(filterQuery);

  return sensors;
};
export const sensorModuleServices = {
  addSensorModuleIntoDB,
  getAllSensorModules,
};

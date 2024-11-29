import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { TAuth } from '../../interface/error';
import { sensorModuleServices } from './sensorModule.service';
import { TSensorModule, TStatus } from './sensorModule.interface';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';

const addSensorModule: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });

  const sensorModule: TSensorModule = req?.body;

  sensorModule.addedBy = auth._id;

  const result = await sensorModuleServices.addSensorModuleIntoDB(sensorModule);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'sensorModule has added successfully',
    data: result,
  });
});

const getAllSensorModules: RequestHandler = catchAsync(async (req, res) => {
  // take query parameter like in stock or sold-out etc
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin', 'showaUser'] });
  const status: TStatus = req?.query?.status as TStatus;

  if (status && status !== 'in-stock' && status !== 'sold-out') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "status must be 'in-stock' or 'sold-out'",
    );
  }
  const result = await sensorModuleServices.getAllSensorModules(status);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All sensor modules are retrieved successfully',
    data: result,
  });
});

const getSensorModuleByMacAddress: RequestHandler = catchAsync(
  async (req, res) => {
    // take query parameter like in stock or sold-out etc
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({ auth, accessUsers: 'all' });
    const macAddress: string = req?.query?.macAddress as string;

    if (!macAddress) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'macAddress is required to get sensor module',
      );
    }
    const result =
      await sensorModuleServices.getSensorModuleByMacAddress(macAddress);
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: ' sensor modules are retrieved successfully',
      data: result,
    });
  },
);
const deleteSensorModule: RequestHandler = catchAsync(async (req, res) => {
  // take query parameter like in stock or sold-out etc
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
  const macAddress: string = req?.query?.macAddress as string;

  if (!macAddress) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'macAddress is required to delete sensor module',
    );
  }
  const result = await sensorModuleServices.deleteSensorModule(macAddress);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'sensor module has removed successfully',
    data: result,
  });
});
export const sensorModuleControllers = {
  addSensorModule,
  getAllSensorModules,
  getSensorModuleByMacAddress,
  deleteSensorModule,
};

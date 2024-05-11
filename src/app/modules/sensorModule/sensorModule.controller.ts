import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { TAuth } from '../../interface/error';
import { sensorModuleServices } from './sensorModule.service';
import { TSensorModule, TStatus } from './sensorModule.interface';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';

const addSensorModule: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
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

export const sensorModuleControllers = {
  addSensorModule,
  getAllSensorModules,
};

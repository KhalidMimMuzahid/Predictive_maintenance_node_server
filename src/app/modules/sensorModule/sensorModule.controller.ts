import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { TAuth } from '../../interface/error';
import { sensorModuleServices } from './sensorModule.service';
import { TSensorModule } from './sensorModule.interface';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

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

const getInstockSensorModules: RequestHandler = catchAsync(async (req, res) => {
  const result = await sensorModuleServices.getAllSensorModules();
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All in sotck sensor modules',
    data: result,
  });
});

export const sensorModuleControllers = {
  addSensorModule,
  getInstockSensorModules,
};

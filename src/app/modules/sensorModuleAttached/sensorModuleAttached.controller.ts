import { RequestHandler } from 'express';
import { sensorAttachedModuleServices } from './sensorModuleAttached.service';
import catchAsync from '../../utils/catchAsync';
import { TAuth } from '../../interface/error';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { TSensorModuleAttached } from './sensorModuleAttached.interface';
import AppError from '../../errors/AppError';

const addSensorAttachedModule: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const sensorModuleAttached: Partial<TSensorModuleAttached> = req?.body;

  sensorModuleAttached.user = auth._id;
  const macAddress: string = req?.query?.macAddress as string;

  if (!macAddress) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'macAddress is required to to purchase sensor module',
    );
  }
  const result =
    await sensorAttachedModuleServices.addSensorAttachedModuleIntoDB(
      macAddress,
      sensorModuleAttached,
    );
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'sensorModule has purchased successfully',
    data: result,
  });
});

export const sensorModuleAttachedControllers = {
  addSensorAttachedModule,
};

import { RequestHandler } from 'express';
import { sensorAttachedModuleServices } from './sensorModuleAttached.service';
import catchAsync from '../../utils/catchAsync';
import { TAuth } from '../../interface/error';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import {
  TAttachedWith,
  TModule,
  TSensorType,
} from './sensorModuleAttached.interface';
import AppError from '../../errors/AppError';
import { Types } from 'mongoose';
import {
  attachedWithArray,
  sensorTypeArray,
} from './sensorModuleAttached.const';

const addSensorAttachedModule: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  const subscriptionPurchased = req?.query?.subscriptionPurchased as string;

  const macAddress: string = req?.query?.macAddress as string;

  if (!subscriptionPurchased || !macAddress) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'macAddress and subscriptionPurchased is required for purchasing sensor module',
    );
  }

  const result =
    await sensorAttachedModuleServices.addSensorAttachedModuleIntoDB({
      macAddress,
      subscriptionPurchased,
      user: auth?._id,
      // sensorModuleAttached,
    });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'sensorModule has purchased successfully',
    data: result,
  });
});

const addSensorData: RequestHandler = catchAsync(async (req, res) => {
  // const sensorModuleAttached: Partial<TSensorModuleAttached> = req?.body;
  // const addSensorData: RequestHandler = catchAsync(async (req, res) => {
  //   // const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  //   // const sensorModuleAttached: Partial<TSensorModuleAttached> = req?.body;

  const macAddress: string = req?.query?.macAddress as string;
  const sensorData: TModule = req?.body?.sensorData as TModule;
  if (!macAddress) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'macAddress is required to to add sensor data',
    );
  }
  const result = await sensorAttachedModuleServices.addSensorDataInToDB({
    macAddress,
    sensorData,
    req,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'sensor data has added successfully',
    data: result,
  });
});

const getAttachedSensorModulesByUser: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    const attachedWith = req?.query?.attachedWith as TAttachedWith;
    if (!attachedWithArray.some((each) => each === attachedWith)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `attachedWith must be any of ${attachedWithArray.reduce(
          (total, current) => {
            total = total + `${current}, `;
            return total;
          },
          '',
        )}`,
      );
    }

    const result =
      await sensorAttachedModuleServices.getAttachedSensorModulesByUser({
        user: auth._id,
        attachedWith,
      });
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'sensorModulesAttached are retrieved successfully',
      data: result,
    });
  },
);

const getAttachedSensorModulesByMachine: RequestHandler = catchAsync(
  async (req, res) => {
    // const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    const { machine_id } = req.query;
    const result =
      await sensorAttachedModuleServices.getAttachedSensorModulesByMachine(
        new Types.ObjectId(machine_id as string),
      );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Attached sensor modules under this machine',
      data: result,
    });
  },
);
const getAllAttachedSensorModulesByMachine: RequestHandler = catchAsync(
  async (req, res) => {
    // const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    const { machine_id } = req.query;
    const result =
      await sensorAttachedModuleServices.getAllAttachedSensorModulesByMachine(
        new Types.ObjectId(machine_id as string),
      );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Attached sensor modules has retrieved successfully',
      data: result,
    });
  },
);

const getSensorData: RequestHandler = catchAsync(async (req, res) => {
  // const sensorModuleAttached: Partial<TSensorModuleAttached> = req?.body;

  // addSensorData,
  const page = parseInt(req?.query?.page as string) || 1;
  const limit = parseInt(req?.query?.limit as string) || 10;

  if (page < 1 || limit < 1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Page and limit cannot be less than 1',
    );
  }

  const macAddress: string = req?.query?.macAddress as string;
  if (!macAddress) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'macAddress is required to to add sensor data',
    );
  }

  const sensorType = req?.query?.sensorType as TSensorType;

  if (!sensorTypeArray.some((each) => each === sensorType)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `sensor type must be any of ${sensorTypeArray.reduce((total, current) => {
        total = total + `${current}, `;
        return total;
      }, '')}`,
    );
  }
  const sensorPositionString = req?.query?.sensorPosition as string;
  const sensorPosition = parseInt(sensorPositionString);

  if (!sensorPosition && sensorPosition !== 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'sensorPosition is required to to get sensor data',
    );
  }
  const result = await sensorAttachedModuleServices.getSensorDataFromDB({
    macAddress,
    sensorType,
    sensorPosition,
    page,
    limit,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'sensor data has retrieved successfully',
    data: result,
  });
});

const toggleSwitchSensorModuleAttached: RequestHandler = catchAsync(
  async (req, res) => {
    // const sensorModuleAttached: Partial<TSensorModuleAttached> = req?.body;

    const macAddress: string = req?.query?.macAddress as string;
    if (!macAddress) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'macAddress is required to stop iot',
      );
    }
    const actionType = req?.query?.switch as 'on' | 'off';
    if (actionType !== 'on' && actionType !== 'off') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'actionType must be any of on or off',
      );
    }
    const result =
      await sensorAttachedModuleServices.toggleSwitchSensorModuleAttached({
        macAddress,
        actionType,
      });
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'sensor has stopped successfully',
      data: result,
    });
  },
);

const getSensorModuleAttachedByMacAddress: RequestHandler = catchAsync(
  async (req, res) => {
    const macAddress: string = req?.query?.macAddress as string;
    if (!macAddress) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'macAddress is required to to get sensor module attached data',
      );
    }
    const result =
      await sensorAttachedModuleServices.getSensorModuleAttachedByMacAddress(
        macAddress,
      );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'sensor module data has retrieved successfully',
      data: result,
    });
  },
);
export const sensorModuleAttachedControllers = {
  addSensorAttachedModule,
  addSensorData,

  getSensorData,
  toggleSwitchSensorModuleAttached,

  getAttachedSensorModulesByUser,
  getAttachedSensorModulesByMachine,
  getAllAttachedSensorModulesByMachine,
  getSensorModuleAttachedByMacAddress,
};

import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { machineServices } from './machine.service';
import { TMachine } from './machine.interface';
import { TAuth } from '../../interface/error';
import AppError from '../../errors/AppError';
import { Types } from 'mongoose';
import { TSensorModuleAttached } from '../sensorModuleAttached/sensorModuleAttached.interface';

const addSensorNonConnectedMachine: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    const machineData: TMachine = req.body;
    machineData.user = auth?._id;
    const result =
      await machineServices.addNonConnectedMachineInToDB(machineData);
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Machine added successfully',
      data: result,
    });
  },
);

const addSensorConnectedMachine: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    const machineData: TMachine = req.body.machine;
    const sensorModuleAttached: Partial<TSensorModuleAttached> =
      req?.body?.sensorModuleAttached;
    sensorModuleAttached.user = auth?._id;

    const sensorModuleMacAddress: string = req.query.macAddress as string;
    if (!sensorModuleMacAddress) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'macAddress is required for adding sensor connected machine',
      );
    }
    machineData.user = auth?._id;

    sensorModuleAttached.user = auth._id;

    const result = await machineServices.addSensorConnectedMachineInToDB({
      sensorModuleMacAddress,
      machineData,
      sensorModuleAttached,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Machine added successfully',
      data: result,
    });
  },
);
const addSensorModuleInToMachine: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    const { machine_id } = req.query;
    const sensorModuleMacAddress: string = req.query.macAddress as string;
    if (!sensorModuleMacAddress) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'macAddress is required for adding sensor connected machine',
      );
    }

    const sensorModuleAttached: Partial<TSensorModuleAttached> =
      req?.body?.sensorModuleAttached;
    sensorModuleAttached.user = auth?._id;

    if (!machine_id) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'machine_id and attachedSensorModuleAttached_id must be provided to add sensor to machine',
      );
    }
    const result = await machineServices.addModuleToMachineInToDB(
      sensorModuleMacAddress,
      new Types.ObjectId(machine_id as string),
      sensorModuleAttached,
    );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'sensor has been added to machine successfully',
      data: result,
    });
  },
);
const addSensorAttachedModuleInToMachine: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    const { machine_id, attachedSensorModuleAttached_id } = req.query;

    if (!machine_id || !attachedSensorModuleAttached_id) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'machine_id and attachedSensorModuleAttached_id must be provided to add sensor to machine',
      );
    }
    const result =
      await machineServices.addSensorAttachedModuleInToMachineIntoDB(
        auth._id,
        new Types.ObjectId(machine_id as string),
        new Types.ObjectId(attachedSensorModuleAttached_id as string),
      );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'sensor has added to machine successfully',
      data: result,
    });
  },
);

const updateMachinePackageStatus: RequestHandler = catchAsync(
  async (req, res) => {
    const { machine_id } = req.query;
    const { package_status } = req.body;

    if (!machine_id) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'machine_id must be provided to update package status',
      );
    }
    if (!package_status) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'package_status must be provided to update package status',
      );
    }
    const result = await machineServices.updateMachinePackageStatus(
      new Types.ObjectId(machine_id as string),
      package_status,
    );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'sensor has added to machine successfully',
      data: result,
    });
  },
);

const getMyWashingMachine: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const results = await machineServices.getMyWashingMachineService(auth._id);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My washing machines',
    data: results,
  });
});

const getMyGeneralMachine: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const results = await machineServices.getMyGeneralMachineService(auth._id);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My general machines',
    data: results,
  });
});

const getUserConnectedMachine: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const results = await machineServices.getUserConnectedMachineService(
    auth._id,
  );
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My connected machines',
    data: results,
  });
});

const getUserNonConnectedGeneralMachine: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    const results =
      await machineServices.getUserNonConnectedGeneralMachineService(auth._id);
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'My non connected general machines',
      data: results,
    });
  },
);

const deleteMachine: RequestHandler = catchAsync(async (req, res) => {
  const { machine_id } = req.query;
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const result = await machineServices.deleteMachineService(
    new Types.ObjectId(machine_id as string),
    auth._id,
  );
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Machine deleted',
    data: result,
  });
});

// const changeStatus: RequestHandler = catchAsync(async (req, res) => {
//   const { id } = req.body;
//   const result = await machineServices.changeStatusService(id);
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Machine deleted',
//     data: result,
//   });
// });

// const addSensor: RequestHandler = catchAsync(async (req, res) => {
//   const { sensorData, id } = req.body;
//   const result = await machineServices.addSensorService(sensorData, id);
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Sensor added',
//     data: result,
//   });
// });
const getAllMachineBy_id: RequestHandler = catchAsync(async (req, res) => {
  const user_id: string = req.query?.user_id as string;
  // const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  const result = await machineServices.getAllMachineBy_id(user_id);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Machines are retrieved successfully',
    data: result,
  });
});
export const machineController = {
  addSensorNonConnectedMachine,
  addSensorConnectedMachine,
  addSensorModuleInToMachine,
  addSensorAttachedModuleInToMachine,
  updateMachinePackageStatus,
  getMyWashingMachine,
  getMyGeneralMachine,
  getUserConnectedMachine,
  getUserNonConnectedGeneralMachine,
  getAllMachineBy_id,
  deleteMachine,
  // changeStatus,
  // addSensor,
};

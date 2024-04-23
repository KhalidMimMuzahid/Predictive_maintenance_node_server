import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { machineServices } from './machine.service';
<<<<<<< HEAD
import { TAuth } from '../../interface/error';
=======
import { TMachine } from './machine.interface';
import { TAuth } from '../../interface/error';
import AppError from '../../errors/AppError';
import { Types } from 'mongoose';
import { TSensorModuleAttached } from '../sensorModuleAttached/sensorModuleAttached.interface';
>>>>>>> 12ab0619eb4a71c040f35f8bdc58f4192d08d1d7

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

<<<<<<< HEAD
const getMyWashingMachine: RequestHandler = catchAsync(async (req, res) => {
  // const { uid } = req.params;
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
  // const { uid } = req.params;
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
=======
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
>>>>>>> 12ab0619eb4a71c040f35f8bdc58f4192d08d1d7

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

// const getMyWashingMachine: RequestHandler = catchAsync(async (req, res) => {
//   const { uid } = req.params;
//   const results = await machineServices.getMyWashingMachineService(uid);
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'My washing machines',
//     data: results,
//   });
// });

// const getMyGeneralMachine: RequestHandler = catchAsync(async (req, res) => {
//   const { uid } = req.params;
//   const results = await machineServices.getMyGeneralMachineService(uid);
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'My general machines',
//     data: results,
//   });
// });

// const getMachine: RequestHandler = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   const result = await machineServices.getMachineService(id);
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'My general machines',
//     data: result,
//   });
// });

// const deleteMachine: RequestHandler = catchAsync(async (req, res) => {
//   const { id } = req.body;
//   const result = await machineServices.deleteMachineService(id);
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Machine deleted',
//     data: result,
//   });
// });

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

export const machineController = {
  addSensorNonConnectedMachine,
  addSensorConnectedMachine,
  addSensorAttachedModuleInToMachine,

  // getMyWashingMachine,
  // getMyGeneralMachine,
  // getMachine,
  // deleteMachine,
  // changeStatus,
  // addSensor,
};

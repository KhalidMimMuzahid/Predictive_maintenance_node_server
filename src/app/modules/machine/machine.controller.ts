import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { machineServices } from './machine.service';
import { TMachine } from './machine.interface';
import { TAuth } from '../../interface/error';

const addNonConnectedMachine: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const machineData: Partial<TMachine> = req.body;
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
});

const getMyWashingMachine: RequestHandler = catchAsync(async (req, res) => {
  const { uid } = req.params;
  const results = await machineServices.getMyWashingMachineService(uid);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My washing machines',
    data: results,
  });
});

const getMyGeneralMachine: RequestHandler = catchAsync(async (req, res) => {
  const { uid } = req.params;
  const results = await machineServices.getMyGeneralMachineService(uid);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My general machines',
    data: results,
  });
});

const getMachine: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await machineServices.getMachineService(id);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My general machines',
    data: result,
  });
});

const deleteMachine: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.body;
  const result = await machineServices.deleteMachineService(id);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Machine deleted',
    data: result,
  });
});

const changeStatus: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.body;
  const result = await machineServices.changeStatusService(id);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Machine deleted',
    data: result,
  });
});

const addSensor: RequestHandler = catchAsync(async (req, res) => {
  const { sensorData, id } = req.body;
  const result = await machineServices.addSensorService(sensorData, id);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Sensor added',
    data: result,
  });
});

export const machineController = {
  addNonConnectedMachine,
  getMyWashingMachine,
  getMyGeneralMachine,
  getMachine,
  deleteMachine,
  changeStatus,
  addSensor,
};

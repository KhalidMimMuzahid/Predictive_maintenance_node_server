import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { machineServices } from './machine.service';

const createWashingMachine: RequestHandler = catchAsync(async (req, res) => {
  const machineData = req.body;
  const result = await machineServices.addMachineService(machineData);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Machine added successfully',
    data: result,
  });
});

// const getMyReservations: RequestHandler = catchAsync(async (req, res) => {
//   const { uid } = req.params;
//   // const results = await reservationServices.getMyReservationsService(uid);
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'My reservations',
//     data: results,
//   });
// });

// const getMyReservationsByStatus: RequestHandler = catchAsync(async (req, res) => {
//   const { uid, status } = req.params;
//   // const results = await reservationServices.getMyReservationsByStatusService(uid, status);
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'My reservations',
//     data: results,
//   });
// });

// const getReservationsByStatus: RequestHandler = catchAsync(async (req, res) => {
//   const { status } = req.params;
//   // const results = await reservationServices.getReservationsByStatusService(status);
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'reservations',
//     data: results,
//   });
// });

export const machineController = {
  // createWashingMachine,
  // getMyReservations,
  // getMyReservationsByStatus,
  // getReservationsByStatus
};

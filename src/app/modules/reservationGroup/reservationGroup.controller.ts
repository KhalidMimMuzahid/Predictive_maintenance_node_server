import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { ReservationRequest } from '../reservation/reservation.model';
import { reservationGroupServices } from './reservationGroup.service';

const createReservationGroup: RequestHandler = catchAsync(async (req, res) => {
  const { reservationIds } = req.body; // array of reservation request ids
  const result = await reservationGroupServices.createReservationRequestGroupService(reservationIds);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reservation Request Group created successfully',
    data: result,
  });
});

const addBid: RequestHandler = catchAsync(async (req, res) => {
  const { bid, groupId } = req.body;
  const results = await reservationGroupServices.addBidService(bid, groupId);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bid Added',
    data: results,
  });
});

// const getMyReservationsByStatus: RequestHandler = catchAsync(async (req, res) => {
//   const { uid, status } = req.params;
//   const results = await reservationServices.getMyReservationsByStatusService(uid, status);
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
//   const results = await reservationServices.getReservationsByStatusService(status);
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'reservations',
//     data: results,
//   });
// });

export const reservationGroupController = {
  createReservationGroup,
  addBid
};

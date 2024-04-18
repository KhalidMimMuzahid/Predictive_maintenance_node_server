import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { reservationServices } from './reservation.service';
import { TAuth } from '../../interface/error';

const createReservationRequest: RequestHandler = catchAsync(
  async (req, res) => {
    const reservationData = req.body;
    const result =
      await reservationServices.createReservationRequestIntoDB(reservationData);
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Reservation Request created successfully',
      data: result,
    });
  },
);

const getMyReservations: RequestHandler = catchAsync(async (req, res) => {
  // const { uid } = req.params;
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const results = await reservationServices.getMyReservationsService(auth._id);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My reservations',
    data: results,
  });
});

const getMyReservationsByStatus: RequestHandler = catchAsync(
  async (req, res) => {
    const { status } = req.params;
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    const results = await reservationServices.getMyReservationsByStatusService(
      auth._id,
      status,
    );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'My reservations',
      data: results,
    });
  },
);

const getReservationsByStatus: RequestHandler = catchAsync(async (req, res) => {
  const { status } = req.params;
  const results =
    await reservationServices.getReservationsByStatusService(status);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'reservations',
    data: results,
  });
});

export const reservationController = {
  createReservationRequest,
  getMyReservations,
  getMyReservationsByStatus,
  getReservationsByStatus,
};

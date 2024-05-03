import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { reservationServices } from './reservation.service';
import { TAuth } from '../../interface/error';
import AppError from '../../errors/AppError';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import { TProblem, TSchedule } from './reservation.interface';

const createReservationRequest: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({ auth, accessUsers: ['showaUser'] });
    const machine: string = req?.query?.machine as string;

    if (!machine) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        '_id of machine is required for creating a reservation',
      );
    }

    // problem: {
    //   issues: { title: string; issue: string }[]; // all issues title one by one
    //   problemDescription?: string;
    //   images: { image: string; title?: string }[];
    // };
    // schedule: {
    //   category:
    //     | 'on-demand'
    //     | 'within-one-week'
    //     | 'within-two-week'
    //     | 'custom-date-picked';
    //   // date: Date;
    //   schedules: Date[]; // every schedule will be stored here , if you re schedule this request 5 times, this array will hold five different date
    // };
    const problem = req?.body?.problem as TProblem;
    const schedule = req?.body?.schedule as TSchedule;
    const result = await reservationServices.createReservationRequestIntoDB({
      user: auth?._id,
      machine_id: machine,
      problem,
      schedule,
    });
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
const getAllReservations: RequestHandler = catchAsync(async (req, res) => {
  // const { uid } = req.params;
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  checkUserAccessApi({
    auth,
    accessUsers: ['serviceProviderAdmin', 'serviceProviderSubAdmin'],
  });
  const results = await reservationServices.getAllReservationsService();
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'successfully retrieve all reservations',
    data: results,
  });
});
export const reservationController = {
  createReservationRequest,
  getMyReservations,
  getMyReservationsByStatus,
  getReservationsByStatus,
  getAllReservations,
};

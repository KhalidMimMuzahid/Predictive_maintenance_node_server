import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { reservationServices } from './reservation.service';
import { TAuth } from '../../interface/error';
import AppError from '../../errors/AppError';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import {
  TMachineType,
  TMachineType2,
  TProblem,
  TReservationType,
  TSchedule,
} from './reservation.interface';
import {
  machineTypeArray,
  reservationTypeArray,
  machineTypeArray2,
} from './reservation.const';

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
    const status: string = req.query.status as string;
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

  const machineType: TMachineType = req?.query?.machineType as TMachineType;
  const reservationType: TReservationType = req?.query
    ?.reservationType as TReservationType;
  if (!machineTypeArray.some((each) => each === machineType)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "machine type must be 'connected' or 'non-connected",
    );
  }

  if (!reservationTypeArray.some((each) => each === reservationType)) {
    //
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `reservationType must be any of ${reservationTypeArray.reduce(
        (total, current) => {
          total = total + `${current}, `;
          return total;
        },
        '',
      )}`,
    );
  }
  checkUserAccessApi({
    auth,
    accessUsers: ['showaAdmin', 'showaSubAdmin'],
  });
  const results = await reservationServices.getAllReservationsService({
    machineType,
    reservationType,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'successfully retrieve all reservations',
    data: results,
  });
});

const uploadRequestImage: RequestHandler = catchAsync(async (req, res) => {
  // const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  const { fileKey, fileType } = req.body;
  const result = await reservationServices.getSignedUrl(fileKey, fileType);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reservation image uploaded successfully',
    data: result,
  });
});
const getAllReservationsByUser: RequestHandler = catchAsync(
  async (req, res) => {
    // const { uid } = req.params;
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    const user: string = req?.query?.user as string;

    if (!user) {
      //
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `user is required to get the reservations for this user`,
      );
    }
    checkUserAccessApi({
      auth,
      accessUsers: ['showaAdmin', 'showaSubAdmin'],
    });
    const results = await reservationServices.getAllReservationsByUser(user);
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'reservation request are retrieved successfully',
      data: results,
    });
  },
);
const getAllReservationsCount: RequestHandler = catchAsync(async (req, res) => {
  // const { uid } = req.params;
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  const machineType: TMachineType2 = req?.query?.machineType as TMachineType2;

  if (!machineTypeArray2.some((each) => each === machineType)) {
    //
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `reservationType must be any of ${machineTypeArray2.reduce(
        (total, current) => {
          total = total + `${current}, `;
          return total;
        },
        '',
      )}`,
    );
  }
  checkUserAccessApi({
    auth,
    accessUsers: ['showaAdmin', 'showaSubAdmin'],
  });
  const results =
    await reservationServices.getAllReservationsCount(machineType);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'successfully retrieve all reservations count',
    data: results,
  });
});
const getAllReservationsByServiceProviderCompany: RequestHandler = catchAsync(
  async (req, res) => {
    // const { uid } = req.params;
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    const serviceProviderCompany: string = req?.query
      ?.serviceProviderCompany as string;

    if (!serviceProviderCompany) {
      //
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `serviceProviderCompany is required to get the reservations for this serviceProviderCompany`,
      );
    }
    checkUserAccessApi({
      auth,
      accessUsers: ['showaAdmin', 'showaSubAdmin', 'serviceProviderAdmin'],
    });
    const results =
      await reservationServices.getAllReservationsByServiceProviderCompany(
        serviceProviderCompany,
      );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'reservation request are retrieved successfully',
      data: results,
    });
  },
);

const getAllScheduledReservationsByServiceProviderCompany: RequestHandler =
  catchAsync(async (req, res) => {
    // const { uid } = req.params;
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    const serviceProviderCompany: string = req?.query
      ?.serviceProviderCompany as string;

    if (!serviceProviderCompany) {
      //
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `serviceProviderCompany is required to get scheduled reservations for this serviceProviderCompany`,
      );
    }
    checkUserAccessApi({
      auth,
      accessUsers: ['showaAdmin', 'showaSubAdmin', 'serviceProviderAdmin'],
    });
    const results =
      await reservationServices.getAllScheduledReservationsByServiceProviderCompany(
        serviceProviderCompany,
      );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'scheduled reservation request are retrieved successfully',
      data: results,
    });
  });
const getReservationCountByServiceProviderCompany: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    checkUserAccessApi({ auth, accessUsers: ['showaAdmin', 'showaSubAdmin'] });

    const serviceProviderCompany: string = req?.query
      ?.serviceProviderCompany as string;
    const result =
      await reservationServices.getReservationCountByServiceProviderCompany(
        serviceProviderCompany,
      );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'reservationCount data has retrieved successfully',
      data: result,
    });
  },
);

export const reservationController = {
  createReservationRequest,
  getMyReservations,
  getMyReservationsByStatus,
  getReservationsByStatus,
  getAllReservations,
  getAllReservationsCount,
  getAllReservationsByUser,
  getAllReservationsByServiceProviderCompany,
  getAllScheduledReservationsByServiceProviderCompany,
  getReservationCountByServiceProviderCompany,
  uploadRequestImage,
};

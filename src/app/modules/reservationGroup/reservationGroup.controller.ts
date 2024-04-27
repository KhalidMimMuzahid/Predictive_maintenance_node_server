import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { reservationGroupServices } from './reservationGroup.service';
import { TAuth } from '../../interface/error';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';

const createReservationGroup: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
  const reservationRequests: string[] = req?.body
    ?.reservationRequests as string[]; // array of reservation request ids
  const result =
    await reservationGroupServices.createReservationRequestGroup(
      reservationRequests,
    );
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reservation Request Group created successfully',
    data: result,
  });
});

const addBid: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: ['serviceProviderAdmin', 'serviceProviderSubAdmin'],
  });

  // biddingUser: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true,
  // },

  // serviceProviderCompany: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'ServiceProviderCompany',
  //   required: true,
  // },
  // biddingAmount:
  const reservationRequestGroup: string = req?.query
    ?.reservationRequestGroup as string;
  const biddingAmount: number = req.body?.biddingAmount as number;

  const results = await reservationGroupServices.addBid({
    reservationRequestGroup_id: reservationRequestGroup,
    biddingUser: auth?._id,
    biddingAmount: biddingAmount,
    role: auth?.role,
  });
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

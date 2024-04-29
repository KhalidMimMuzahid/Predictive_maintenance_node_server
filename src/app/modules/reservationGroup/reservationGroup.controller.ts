import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { reservationGroupServices } from './reservationGroup.service';
import { TAuth } from '../../interface/error';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import AppError from '../../errors/AppError';

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

const selectBiddingWinner: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: ['showaAdmin'],
  });

  const bid: string = req?.query?.bid as string;
  const reservationRequestGroup: string = req?.query
    ?.reservationRequestGroup as string;
  if (!bid || !reservationRequestGroup) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      '_id for bid & reservationRequestGroup are required to select winner',
    );
  }
  const results = await reservationGroupServices.selectBiddingWinner({
    reservationRequestGroup_id: reservationRequestGroup,
    bid_id: bid,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'service provider company has selected as winner successfully',
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
  addBid,
  selectBiddingWinner,
};

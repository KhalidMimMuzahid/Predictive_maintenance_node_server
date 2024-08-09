import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { reservationGroupServices } from './reservationGroup.service';
import { TAuth } from '../../interface/error';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import AppError from '../../errors/AppError';
import {
  TBiddingDate,
  TReservationGroupType,
} from './reservationGroup.interface';
import { TMachineType } from '../reservation/reservation.interface';
import { machineTypeArray } from '../reservation/reservation.const';
import { reservationGroupTypeArray } from './reservationGroup.const';

const createReservationGroup: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });
  const reservationRequests: string[] = req?.body
    ?.reservationRequests as string[];
  const groupName: string = req?.body?.groupName as string; // array of reservation request ids
  const biddingDate: Partial<TBiddingDate> = req?.body?.biddingDate;
  if (!reservationRequests?.length || !groupName) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'reservationRequests and groupName are required to make group',
    );
  }
  const result = await reservationGroupServices.createReservationRequestGroup({
    reservationRequests,
    groupName,
    biddingDate,
  });
  // const result = 'result';
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reservation Request Group created successfully',
    data: result,
  });
});

const allReservationsGroup: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: ['showaAdmin'],
  });
  const groupForMachineType: TMachineType = req?.query
    ?.groupForMachineType as TMachineType;

  if (!machineTypeArray.some((each) => each === groupForMachineType)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `machine type must be any of ${machineTypeArray.reduce(
        (total, current) => {
          total = total + `${current}, `;
          return total;
        },
        '',
      )}`,
    );
  }
  const reservationGroupType: TReservationGroupType = req?.query
    ?.reservationGroupType as TReservationGroupType;

  if (
    !reservationGroupTypeArray.some((each) => each === reservationGroupType)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `machine type must be any of ${reservationGroupTypeArray.reduce(
        (total, current) => {
          total = total + `${current}, `;
          return total;
        },
        '',
      )}`,
    );
  }
  const results = await reservationGroupServices.allReservationsGroup({
    groupForMachineType,
    reservationGroupType,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'reservation groups are retrieved successfully',
    data: results,
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

const setBiddingDate: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: ['showaAdmin'],
  });
  const reservationRequestGroup: string = req?.query
    ?.reservationRequestGroup as string;
  const biddingDate: Partial<TBiddingDate> = req?.body?.biddingDate;
  if (
    !reservationRequestGroup ||
    (!biddingDate?.endDate && biddingDate?.endDate)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'reservationRequestGroup and biddingDate are required to add biddingDate',
    );
  }
  const results = await reservationGroupServices.setBiddingDate({
    reservationRequestGroup_id: reservationRequestGroup,
    biddingDate,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bidding date has successfully set',
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
    message: 'Service provider company has selected as winner successfully',
    data: results,
  });
});
const sendReservationGroupToBranch: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({
      auth,
      accessUsers: ['serviceProviderAdmin', 'serviceProviderSubAdmin'],
    });

    const reservationRequestGroup: string = req?.query
      ?.reservationRequestGroup as string;
    const serviceProviderBranch: string = req?.query
      ?.serviceProviderBranch as string;
    if (!reservationRequestGroup || !serviceProviderBranch) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        '_id of reservationRequestGroup & serviceProviderBranch are required to send it to branch',
      );
    }
    const results = await reservationGroupServices.sendReservationGroupToBranch(
      {
        user: auth?._id,
        reservationRequestGroup_id: reservationRequestGroup,
        serviceProviderBranch_id: serviceProviderBranch,
      },
    );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'reservation group has sent to a branch',
      data: results,
    });
  },
);
const getReservationGroupById: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: ['showaAdmin'],
  });

  const reservationRequestGroup: string = req?.query
    ?.reservationRequestGroup as string;

  if (!reservationRequestGroup) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      '_id of reservationRequestGroup is required to get res group ',
    );
  }
  const results = await reservationGroupServices.getReservationGroupById(
    reservationRequestGroup,
  );
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'reservation group has retrieved successfully',
    data: results,
  });
});

const getLiveReservationGroups: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({
      auth,
      accessUsers: ['showaAdmin', 'showaSubAdmin'],
    });

    const results = await reservationGroupServices.getLiveReservationGroups();
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'live reservation groups have retrieved successfully',
      data: results,
    });
  },
);

const getBidedReservationGroupsByCompany: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({
      auth,
      accessUsers: ['serviceProviderAdmin'],
    });

    const results =
      await reservationGroupServices.getBidedReservationGroupsByCompany({
        user: auth?._id,
      });
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'bided reservation groups have retrieved successfully',
      data: results,
    });
  },
);

const getAllUnAssignedResGroupToBranchByCompany: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({
      auth,
      accessUsers: ['serviceProviderAdmin'],
    });

    const results =
      await reservationGroupServices.getAllUnAssignedResGroupToBranchByCompany({
        user: auth?._id,
      });
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        'all un-assigned res-group to branch have retrieved successfully',
      data: results,
    });
  },
);

const getAllOnDemandResGroupByCompany: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({
      auth,
      accessUsers: ['serviceProviderAdmin'],
    });

    const results =
      await reservationGroupServices.getAllOnDemandResGroupByCompany({
        user: auth?._id,
      });
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'all on-demand res-groups have retrieved successfully',
      data: results,
    });
  },
);

const getAllOnDemandUnassignedToCompanyResGroups: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({
      auth,
      accessUsers: ['serviceProviderAdmin'],
    });

    const results =
      await reservationGroupServices.getAllOnDemandUnassignedToCompanyResGroups();
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        'all on-demand unassigned to company res-groups have retrieved successfully',
      data: results,
    });
  },
);
const acceptOnDemandResGroupByCompany: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({
      auth,
      accessUsers: ['serviceProviderAdmin'],
    });
    const reservationGroup = req?.query?.reservationRequestGroup as string;
    if (!reservationGroup) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'reservation Group is required accept on-demand request',
      );
    }
    const results =
      await reservationGroupServices.acceptOnDemandResGroupByCompany({
        user: auth?._id,
        reservationGroup,
      });
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'accepted on-demand res-group by company successfully',
      data: results,
    });
  },
);
const updateBid: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: ['showaAdmin', 'showaSubAdmin'],
  });

  const reservationRequestGroup: string = req?.query
    ?.reservationRequestGroup as string;
  const updateData = req?.body;
  if (!reservationRequestGroup) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      '_id of reservationRequestGroup is required to update res group ',
    );
  }
  const results = await reservationGroupServices.updateBid({
    reservationRequestGroup_id: reservationRequestGroup,
    updateData,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'reservation group has updated successfully',
    data: results,
  });
});

const deleteBid: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: ['showaAdmin', 'showaSubAdmin'],
  });

  const reservationRequestGroup: string = req?.query
    ?.reservationRequestGroup as string;
  const serviceProviderCompany: string = req?.query
    ?.serviceProviderCompany as string;
  if (!reservationRequestGroup || !serviceProviderCompany) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      '_id of reservationRequestGroup & serviceProviderCompany is required to delete bid ',
    );
  }
  const results = await reservationGroupServices.deleteBid({
    reservationRequestGroup: reservationRequestGroup,
    serviceProviderCompany: serviceProviderCompany,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'reservation group has deleted successfully',
    data: results,
  });
});

export const reservationGroupController = {
  createReservationGroup,
  allReservationsGroup,
  addBid,
  setBiddingDate,
  selectBiddingWinner,
  sendReservationGroupToBranch,
  getReservationGroupById,
  getLiveReservationGroups,
  getBidedReservationGroupsByCompany,
  getAllUnAssignedResGroupToBranchByCompany,
  getAllOnDemandResGroupByCompany,
  getAllOnDemandUnassignedToCompanyResGroups,
  acceptOnDemandResGroupByCompany,
  updateBid,
  deleteBid,
};

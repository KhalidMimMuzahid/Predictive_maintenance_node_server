import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { TAuth } from '../../interface/error';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { invoiceGroupServices } from './invoiceGroup.service';

const assignReservationGroupToTeam: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({
      auth,
      accessUsers: ['serviceProviderBranchManager'],
    });

    const reservationRequestGroup: string = req?.query
      ?.reservationRequestGroup as string;

    const teamOfEngineers: string = req?.query?.teamOfEngineers as string;
    if (!reservationRequestGroup || !teamOfEngineers) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        '_id of reservationRequestGroup & teamOfEngineers are required to assign it to team ',
      );
    }
    const results = await invoiceGroupServices.assignReservationGroupToTeam({
      user: auth?._id,
      reservationRequestGroup_id: reservationRequestGroup,
      teamOfEngineers_id: teamOfEngineers,
    });
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'reservation group has assigned to team ',
      data: results,
    });
  },
);



export const invoiceGroupController = {
  assignReservationGroupToTeam,
};

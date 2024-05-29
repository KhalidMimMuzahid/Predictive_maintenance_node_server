import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { TAuth } from '../../interface/error';
import { teamOfEngineersServices } from './teamOfEngineers.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';

const makeTeamOfEngineers: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: ['serviceProviderBranchManager'] });
  const serviceProviderEngineers: string[] = req?.body
    ?.serviceProviderEngineers as string[];

  const teamName: string = req?.body?.teamName as string;

  const result = await teamOfEngineersServices.makeTeamOfEngineerInToDB({
    teamName,
    serviceProviderEngineers,
    createdBy: auth._id,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'team of engineers has added successfully',
    data: result,
  });
});

const getAllTeamsOfEngineers: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  checkUserAccessApi({
    auth,
    accessUsers: ['showaAdmin'],
  });
  const result = await teamOfEngineersServices.getAllTeamsOfEngineers();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'team of engineers data retrived successfully',
    data: result,
  });
});

export const teamOfEngineersControllers = {
  makeTeamOfEngineers,
  getAllTeamsOfEngineers,
};

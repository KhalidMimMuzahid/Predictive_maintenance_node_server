import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { TAuth } from '../../interface/error';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import { serviceProviderBranchServices } from './serviceProviderBranch.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

const createServiceProviderBranch: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({ auth, accessUsers: ['serviceProviderAdmin'] });

    const serviceProviderBranch = req?.body;

    const result =
      await serviceProviderBranchServices.createServiceProviderBranchInToDB({
        user: auth?._id,
        serviceProviderBranch,
      });
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Service Provider Branch has created successfully',
      data: result,
    });
  },
);

export const serviceProviderBranchController = {
  createServiceProviderBranch,
};

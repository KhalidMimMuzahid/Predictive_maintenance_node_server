import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import { TAuth } from '../../interface/error';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import { serviceProviderBranchServices } from './serviceProviderBranch.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TAddress } from '../common/common.interface';

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
const updateAddress: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  checkUserAccessApi({ auth, accessUsers: 'all' });
  const document_id = req.query?.document_id as string;

  if (!document_id) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'document_id must be provided to update address',
    );
  }

  const address = req?.body as TAddress;
  const result = await serviceProviderBranchServices.updateAddress({
    document_id,
    address,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'address updated successfully',
    data: result,
  });
});
export const serviceProviderBranchController = {
  createServiceProviderBranch,
  updateAddress,
};

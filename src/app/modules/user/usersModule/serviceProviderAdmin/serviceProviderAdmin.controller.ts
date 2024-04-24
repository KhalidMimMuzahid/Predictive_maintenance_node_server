import { RequestHandler } from 'express';
import { serviceProviderAdminServices } from './serviceProviderAdmin.service';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';
import httpStatus from 'http-status';

const createServiceProviderAdmin: RequestHandler = catchAsync(
  async (req, res) => {
    const {
      rootUser,
      serviceProviderAdmin,
      serviceProviderCompany,
      serviceProviderBranch,
    } = req.body;

    const result =
      await serviceProviderAdminServices.createServiceProviderAdminIntoDB(
        rootUser,
        serviceProviderAdmin,
        serviceProviderCompany,
        serviceProviderBranch,
      );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User created successfully',
      data: result,
    });
  },
);

export const serviceProviderAdminControllers = {
  createServiceProviderAdmin,
};

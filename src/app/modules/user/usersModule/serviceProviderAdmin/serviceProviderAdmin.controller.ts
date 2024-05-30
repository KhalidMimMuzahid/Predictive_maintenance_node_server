import { RequestHandler } from 'express';
import { serviceProviderAdminServices } from './serviceProviderAdmin.service';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';
import httpStatus from 'http-status';
import { TAuth } from '../../../../interface/error';

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

const addServiceProviderBranch: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    const { serviceProviderBranch } = req.body;
    const result = await serviceProviderAdminServices.addServiceProviderBranch(
      auth.uid,
      serviceProviderBranch,
    );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Service provider branch added successfully',
      data: result,
    });
  },
);

export const serviceProviderAdminControllers = {
  createServiceProviderAdmin,
  addServiceProviderBranch,
};

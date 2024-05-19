import { checkUserAccessApi } from './../../utils/checkUserAccessApi';
import httpStatus from 'http-status';
import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TAuth } from '../../interface/error';
import { serviceProviderCompanyServices } from './serviceProviderCompany.service';

const getServiceProviderCompanyForAdmin: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    checkUserAccessApi({ auth, accessUsers: ['serviceProviderAdmin'] });
    const result =
      await serviceProviderCompanyServices.getServiceProviderCompanyForAdmin(
        auth?._id,
      );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'serviceProviderCompany retrieved successfully',
      data: result,
    });
  },
);

const getAllServiceProviderCompanies: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    checkUserAccessApi({ auth, accessUsers: ['showaAdmin', 'showaSubAdmin'] });
    const result =
      await serviceProviderCompanyServices.getAllServiceProviderCompanies();
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'serviceProviderCompany retrieved successfully',
      data: result,
    });
  },
);




export const serviceProviderCompanyControllers = {
  getServiceProviderCompanyForAdmin,
  getAllServiceProviderCompanies,
};

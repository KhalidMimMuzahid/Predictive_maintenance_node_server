import { checkUserAccessApi } from './../../utils/checkUserAccessApi';
import httpStatus from 'http-status';
import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TAuth } from '../../interface/error';
import { serviceProviderCompanyServices } from './serviceProviderCompany.service';
import AppError from '../../errors/AppError';

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
const getAllProfileByServiceProviderCompany: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    checkUserAccessApi({ auth, accessUsers: ['serviceProviderAdmin'] });
    const result =
      await serviceProviderCompanyServices.getAllProfileByServiceProviderCompany(
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
const getServiceProviderCompanyBy_id: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });

    const serviceProviderCompany = req?.query?.serviceProviderCompany as string;
    if (!serviceProviderCompany) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'serviceProviderCompany is required to get company details',
      );
    }

    const result =
      await serviceProviderCompanyServices.getServiceProviderCompanyBy_id(
        serviceProviderCompany,
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
    // const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    // checkUserAccessApi({ auth, accessUsers: ['showaAdmin', 'showaSubAdmin'] });
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

const getAllMembersForServiceProviderCompany: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    checkUserAccessApi({ auth, accessUsers: ['showaAdmin', 'showaSubAdmin'] });

    const serviceProviderCompany: string = req?.query
      ?.serviceProviderCompany as string;

    if (!serviceProviderCompany) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'serviceProviderCompany is required to get All Members',
      );
    }
    const result =
      await serviceProviderCompanyServices.getAllMembersForServiceProviderCompany(
        serviceProviderCompany,
      );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        'All Members For ServiceProviderCompany has retrieved successfully',
      data: result,
    });
  },
);

export const serviceProviderCompanyControllers = {
  getServiceProviderCompanyForAdmin,
  getAllProfileByServiceProviderCompany,
  getServiceProviderCompanyBy_id,
  getAllServiceProviderCompanies,
  getAllMembersForServiceProviderCompany,
};

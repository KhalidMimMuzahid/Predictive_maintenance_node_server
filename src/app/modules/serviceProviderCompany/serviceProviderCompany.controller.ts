import { companyStatusArray } from './serviceProviderCompany.const';
import { checkUserAccessApi } from './../../utils/checkUserAccessApi';
import httpStatus from 'http-status';
import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TAuth } from '../../interface/error';
import { serviceProviderCompanyServices } from './serviceProviderCompany.service';
import AppError from '../../errors/AppError';
import {
  TCompanyStatus,
  TServiceProviderCompany,
} from './serviceProviderCompany.interface';
import { TSortType } from '../marketplace/product/product.interface';

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

const editServiceProviderCompany: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    checkUserAccessApi({
      auth,
      accessUsers: ['serviceProviderAdmin', 'showaAdmin'],
    });
    const serviceProviderCompany = req?.query?.serviceProviderCompany as string;

    if (!serviceProviderCompany) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'serviceProviderCompany is required to edit serviceProviderCompany',
      );
    }
    const serviceProviderCompanyData =
      req?.body as Partial<TServiceProviderCompany>;
    const result =
      await serviceProviderCompanyServices.editServiceProviderCompany({
        user: auth?._id,
        serviceProviderCompany,
        serviceProviderCompanyData,
        auth,
      });
    // send response

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'serviceProviderCompany has updated successfully',
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
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    checkUserAccessApi({ auth, accessUsers: ['showaAdmin', 'showaSubAdmin'] });

    const area = req?.query?.area as string;
    const sortType = (req?.query?.sortType as TSortType) || 'desc';
    const status = (req?.query?.status as TCompanyStatus) || 'success';

    if (!companyStatusArray.some((each) => each === status)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `status must be any of ${companyStatusArray.reduce((total, current) => {
          total = total + `${current}, `;
          return total;
        }, '')}`,
      );
    }
    const result =
      await serviceProviderCompanyServices.getAllServiceProviderCompanies({
        area,
        sortType,
        status,
      });
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
const getMainDashboardFirstSectionSummary: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    checkUserAccessApi({ auth, accessUsers: 'all' });

    const serviceProviderCompany: string = req?.query
      ?.serviceProviderCompany as string;
    const serviceProviderBranch: string = req?.query
      ?.serviceProviderBranch as string;

    if (!serviceProviderCompany && !serviceProviderBranch) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `serviceProviderCompany or serviceProviderBranch is required`,
      );
    } else if (serviceProviderCompany && serviceProviderBranch) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        ` one of these serviceProviderCompany or serviceProviderBranch is required at a time, not both`,
      );
    }
    const result =
      await serviceProviderCompanyServices.getMainDashboardFirstSectionSummary({
        serviceProviderCompany,
        serviceProviderBranch,
      });
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

const getMainDashboardReportCardSummary: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;
    checkUserAccessApi({ auth, accessUsers: 'all' });

    const serviceProviderCompany: string = req?.query
      ?.serviceProviderCompany as string;
    const serviceProviderBranch: string = req?.query
      ?.serviceProviderBranch as string;

    if (!serviceProviderCompany && !serviceProviderBranch) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `serviceProviderCompany or serviceProviderBranch is required`,
      );
    } else if (serviceProviderCompany && serviceProviderBranch) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        ` one of these serviceProviderCompany or serviceProviderBranch is required at a time, not both`,
      );
    }

    const numberOfCardString: string = req?.query?.numberOfCard as string;

    const numberOfCard = parseInt(numberOfCardString);

    if (!numberOfCard) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `numberOfCard is required to get report card`,
      );
    }
    const result =
      await serviceProviderCompanyServices.getMainDashboardReportCardSummary({
        serviceProviderCompany,
        serviceProviderBranch,
        numberOfCard,
      });
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
  editServiceProviderCompany,
  getAllProfileByServiceProviderCompany,
  getServiceProviderCompanyBy_id,
  getAllServiceProviderCompanies,
  getAllMembersForServiceProviderCompany,
  getMainDashboardFirstSectionSummary, // Service Provider CXO/Branch manager Main dashboard screen
  getMainDashboardReportCardSummary, // report card in CXO screen
};

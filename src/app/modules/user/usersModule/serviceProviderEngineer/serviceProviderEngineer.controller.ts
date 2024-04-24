import { RequestHandler } from 'express';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../../../errors/AppError';
import { serviceProviderEngineerServices } from './serviceProviderEngineer.service';
import { TAuth } from '../../../../interface/error';
const createServiceProviderEngineer: RequestHandler = catchAsync(
  async (req, res) => {
    const { rootUser, serviceProviderEngineer } = req.body;
    const serviceProviderCompany: string = req.query
      .serviceProviderCompany as string;
    if (!serviceProviderCompany) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'serviceProviderCompany._id is required for signing up an engineer',
      );
    }

    const result =
      await serviceProviderEngineerServices.createServiceProviderEngineerIntoDB(
        { serviceProviderCompany, rootUser, serviceProviderEngineer },
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

const approveAndAssignEngineerInToBranch: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    if (auth.role !== 'serviceProviderAdmin') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'only service provider admin has access for this api',
      );
    }
    const serviceProviderEngineer = req?.query?.serviceProviderEngineer;
    const serviceProviderBranch = req?.query?.serviceProviderBranch; // you you are not sending this info from front end; means you just want to approve this engineer currentState status; if you provide this info, means you want to approve and also assign this engineer to a specific branch

    if (!serviceProviderEngineer) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'engineer _id are required to assign engineer',
      );
    }

    const result =
      await serviceProviderEngineerServices.approveServiceProviderEngineerIntoDB(
        auth as TAuth,
        serviceProviderEngineer as string,
        serviceProviderBranch as string,
      );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Engineer has approved successfully',
      data: result,
    });
  },
);
export const serviceProviderEngineerControllers = {
  createServiceProviderEngineer,
  approveAndAssignEngineerInToBranch,
};

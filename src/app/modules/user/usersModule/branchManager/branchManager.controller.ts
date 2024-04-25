import { RequestHandler } from 'express';
import catchAsync from '../../../../utils/catchAsync';
import AppError from '../../../../errors/AppError';
import httpStatus from 'http-status';
import { serviceProviderBranchManagerServices } from './branchManager.service';
import sendResponse from '../../../../utils/sendResponse';
import { TAuth } from '../../../../interface/error';

const createServiceProviderBranchManager: RequestHandler = catchAsync(
  async (req, res) => {
    const { rootUser, serviceProviderBranchManager } = req.body;
    const serviceProviderCompany: string = req.query
      .serviceProviderCompany as string;
    if (!serviceProviderCompany) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'serviceProviderCompany._id is required for signing up a branch manager',
      );
    }

    const result =
      await serviceProviderBranchManagerServices.createServiceProviderBranchManagerIntoDB(
        { serviceProviderCompany, rootUser, serviceProviderBranchManager },
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
const approveAndAssignBranchManagerInToBranch: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    if (auth.role !== 'serviceProviderAdmin') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'only service provider admin has access for this api',
      );
    }
    const serviceProviderBranchManager =
      req?.query?.serviceProviderBranchManager;
    const serviceProviderBranch = req?.query?.serviceProviderBranch; // you you are not sending this info from front end; means you just want to approve this engineer currentState status; if you provide this info, means you want to approve and also assign this engineer to a specific branch

    if (!serviceProviderBranchManager) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'branch manager _id is required to assign branch manager',
      );
    }

    const result =
      await serviceProviderBranchManagerServices.approveServiceProviderBranchManagerIntoDB(
        auth as TAuth,
        serviceProviderBranchManager as string,
        serviceProviderBranch as string,
      );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Branch Manager has approved successfully',
      data: result,
    });
  },
);
export const serviceProviderBranchManagerControllers = {
  createServiceProviderBranchManager,
  approveAndAssignBranchManagerInToBranch,
};

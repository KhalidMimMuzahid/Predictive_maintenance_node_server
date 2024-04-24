import { RequestHandler } from 'express';
import catchAsync from '../../../../utils/catchAsync';
import AppError from '../../../../errors/AppError';
import httpStatus from 'http-status';
import { serviceProviderBranchManagerServices } from './branchManager.service';
import sendResponse from '../../../../utils/sendResponse';

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

export const serviceProviderBranchManagerControllers = {
  createServiceProviderBranchManager,
};

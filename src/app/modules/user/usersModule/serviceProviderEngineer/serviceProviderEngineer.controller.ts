import { RequestHandler } from 'express';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../../../errors/AppError';
import { serviceProviderEngineerServices } from './serviceProviderEngineer.service';

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

export const serviceProviderEngineerControllers = {
  createServiceProviderEngineer,
};

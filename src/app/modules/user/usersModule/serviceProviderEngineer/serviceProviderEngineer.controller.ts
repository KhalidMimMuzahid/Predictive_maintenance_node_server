import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import AppError from '../../../../errors/AppError';
import { TAuth } from '../../../../interface/error';
import catchAsync from '../../../../utils/catchAsync';
import { checkUserAccessApi } from '../../../../utils/checkUserAccessApi';
import sendResponse from '../../../../utils/sendResponse';
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
    const invitedMember: string = req?.query?.invitedMember as string;
    const result =
      await serviceProviderEngineerServices.createServiceProviderEngineerIntoDB(
        {
          serviceProviderCompany,
          rootUser,
          serviceProviderEngineer,
          invitedMember,
        },
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

    // we are checking the permission of this api
    checkUserAccessApi({ auth, accessUsers: ['serviceProviderAdmin'] });
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

const editServiceProviderEngineer: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req.headers.auth as unknown as TAuth;

    checkUserAccessApi({
      auth,
      accessUsers: ['serviceProviderAdmin'],
    });

    const serviceProviderEngineerId = req.query
      .serviceProviderEngineerId as string;
    const updateData = req.body;

    if (!serviceProviderEngineerId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Engineer ID is required');
    }

    const result =
      await serviceProviderEngineerServices.editServiceProviderEngineer(
        auth,
        serviceProviderEngineerId,
        updateData,
      );

    // Send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Engineer updated successfully',
      data: result,
    });
  },
);

export const serviceProviderEngineerControllers = {
  createServiceProviderEngineer,
  approveAndAssignEngineerInToBranch,
  editServiceProviderEngineer,
};

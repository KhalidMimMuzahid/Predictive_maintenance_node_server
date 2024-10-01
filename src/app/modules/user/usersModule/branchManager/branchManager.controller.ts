import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import AppError from '../../../../errors/AppError';
import { TAuth } from '../../../../interface/error';
import catchAsync from '../../../../utils/catchAsync';
import { checkUserAccessApi } from '../../../../utils/checkUserAccessApi';
import sendResponse from '../../../../utils/sendResponse';
import { serviceProviderBranchManagerServices } from './branchManager.service';

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

    const invitedMember: string = req?.query?.invitedMember as string;

    const result =
      await serviceProviderBranchManagerServices.createServiceProviderBranchManagerIntoDB(
        {
          serviceProviderCompany,
          rootUser,
          serviceProviderBranchManager,
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
const approveAndAssignBranchManagerInToBranch: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({ auth, accessUsers: ['serviceProviderAdmin'] });

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

// const editServiceProviderBranchManager: RequestHandler = catchAsync(
//   async (req, res) => {
//     const auth: TAuth = req.headers.auth as unknown as TAuth;

//     // Ensure only serviceProviderAdmin can access this API
//     checkUserAccessApi({
//       auth,
//       accessUsers: ['serviceProviderAdmin'],
//     });

//     const { serviceProviderBranchManagerId } = req.params;
//     const updateData = req.body;
//     const serviceProviderBranch = req.query.serviceProviderBranch as string;

//     if (!serviceProviderBranchManagerId) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'Branch Manager ID is required',
//       );
//     }
//     console.log(serviceProviderBranchManagerId);

//     const result =
//       await serviceProviderBranchManagerServices.editServiceProviderBranchManager(
//         auth,
//         serviceProviderBranchManagerId,
//         updateData,
//         serviceProviderBranch,
//       );
//     // Send response
//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: 'Branch Manager updated successfully',
//       data: result,
//     });
//   },
// );

// const editServiceProviderBranchManager: RequestHandler = catchAsync(
//   async (req, res) => {
//     const auth: TAuth = req.headers.auth as unknown as TAuth;

//     // Ensure only serviceProviderAdmin can access this API
//     checkUserAccessApi({
//       auth,
//       accessUsers: ['serviceProviderAdmin'],
//     });

//     const serviceProviderBranchManagerId = req.query
//       .serviceProviderBranchManagerId as string;
//     const updateData = req.body;
//     const serviceProviderBranch = req.query.serviceProviderBranch as string;

//     if (!serviceProviderBranchManagerId) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'Branch Manager ID is required',
//       );
//     }

//     const result =
//       await serviceProviderBranchManagerServices.editServiceProviderBranchManager(
//         auth,
//         serviceProviderBranchManagerId,
//         updateData,
//         serviceProviderBranch,
//       );

//     // Send response
//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: 'Branch Manager updated successfully',
//       data: result,
//     });
//   },
// );

const editServiceProviderBranchManager: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req.headers.auth as unknown as TAuth;

    checkUserAccessApi({
      auth,
      accessUsers: ['serviceProviderAdmin'],
    });

    const serviceProviderBranchManagerId = req.query
      .serviceProviderBranchManagerId as string;
    const updateData = req.body;

    if (!serviceProviderBranchManagerId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Branch Manager ID is required',
      );
    }

    const result =
      await serviceProviderBranchManagerServices.editServiceProviderBranchManager(
        auth,
        serviceProviderBranchManagerId,
        updateData,
      );

    // Send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Branch Manager updated successfully',
      data: result,
    });
  },
);

export const serviceProviderBranchManagerControllers = {
  createServiceProviderBranchManager,
  approveAndAssignBranchManagerInToBranch,
  editServiceProviderBranchManager,
};

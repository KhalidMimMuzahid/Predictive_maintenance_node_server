import { RequestHandler } from 'express';
import { serviceProviderAdminServices } from './serviceProviderAdmin.service';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';
import httpStatus from 'http-status';

const createServiceProviderAdmin: RequestHandler = catchAsync(
  async (req, res) => {
    const { rootUser, serviceProviderAdmin } = req.body;
    const result =
      await serviceProviderAdminServices.createServiceProviderAdminIntoDB(
        rootUser,
        serviceProviderAdmin,
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

// const signIn: RequestHandler = catchAsync(async (req, res) => {
//   const uid = req?.query?.uid;
//   if (!uid) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'uid is required to sign in');
//   }
//   const result = await showaUserServices.signIn(uid as string);
//   // send response
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'User created successfully',
//     data: result,
//   });
// });

export const serviceProviderAdminControllers = {
  createServiceProviderAdmin,
  //   signIn,
};

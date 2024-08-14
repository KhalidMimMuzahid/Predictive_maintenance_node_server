import { RequestHandler } from 'express';
import { TAuth } from '../../interface/error';
import catchAsync from '../../utils/catchAsync';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { invoiceServices } from './invoice.services';
import sendResponse from '../../utils/sendResponse';
import { TAdditionalProduct } from './invoice.interface';

const addAdditionalProducts: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: ['serviceProviderEngineer', 'showaAdmin'],
  });

  const reservationRequest: string = req?.query?.reservationRequest as string;

  const additionalProduct: TAdditionalProduct = req?.body as TAdditionalProduct;
  if (!reservationRequest || !additionalProduct) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'reservationRequest and additionalProduct are required to add additional products',
    );
  }
  const results = await invoiceServices.addAdditionalProduct({
    user: auth?._id,
    role: auth?.role as 'showaAdmin' | 'serviceProviderEngineer',
    reservationRequest_id: reservationRequest,
    additionalProduct: additionalProduct,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'additional products has been added',
    data: results,
  });
});














const changeStatusToCompleted: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: ['serviceProviderEngineer'],
  });

  const reservationRequest: string = req?.query?.reservationRequest as string;

  if (!reservationRequest) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'reservationRequest ais required to change status',
    );
  }
  const results = await invoiceServices.changeStatusToCompleted({
    user: auth?._id,
    reservationRequest_id: reservationRequest,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'status has changed to completed',
    data: results,
  });
});
const getAllInvoices: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: ['showaAdmin'],
  });

  const result = await invoiceServices.getAllInvoices();
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'invoices are retrieved successfully',
    data: result,
  });
});
const getAllInvoicesByUser: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: ['showaAdmin'],
  });

  const user: string = req?.query?.user as string;

  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'user is required to get invoices for user',
    );
  }
  const result = await invoiceServices.getAllInvoicesByUser(user);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'invoices are retrieved successfully',
    data: result,
  });
});

const getAllAssignedTasksByEngineer: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    // we are checking the permission of this api
    checkUserAccessApi({
      auth,
      accessUsers: ['serviceProviderEngineer'],
    });

    const result = await invoiceServices.getAllAssignedTasksByEngineer(
      auth?._id,
    );
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'all task are retrieved successfully',
      data: result,
    });
  },
);

export const invoiceController = {
  addAdditionalProducts,
  changeStatusToCompleted,
  getAllInvoices,
  getAllInvoicesByUser,
  getAllAssignedTasksByEngineer,
};

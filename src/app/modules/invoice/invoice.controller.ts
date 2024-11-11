import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TAuth } from '../../interface/error';
import catchAsync from '../../utils/catchAsync';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import sendResponse from '../../utils/sendResponse';
import { assignedTaskTypeArray } from './invoice.const';
import {
  TAdditionalProduct,
  TAssignedTaskType,
  TInspecting,
} from './invoice.interface';
import { invoiceServices } from './invoice.services';

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

const inspection: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: ['serviceProviderEngineer'],
  });

  const reservationRequest: string = req?.query?.reservationRequest as string;

  const inspectingData: TInspecting = req?.body as TInspecting;
  if (!reservationRequest || !inspectingData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'reservationRequest and inspectingData are required to inspect reservation',
    );
  }
  const result = await invoiceServices.inspection({
    user: auth?._id,
    reservationRequest,
    inspectingData,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'additional products has been added',
    data: result,
  });
});

const startInspection: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: ['serviceProviderEngineer'],
  });

  const reservationRequest: string = req?.query?.reservationRequest as string;

  if (!reservationRequest) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'reservationRequest is required to start inspect reservation',
    );
  }
  const result = await invoiceServices.startInspection({
    user: auth?._id,
    reservationRequest,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'inspection has started successfully',
    data: result,
  });
});

const inspectionReport: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // // we are checking the permission of this api
  checkUserAccessApi({
    auth,
    accessUsers: ['serviceProviderEngineer'],
  });

  const reservationRequest: string = req?.query?.reservationRequest as string;

  const issues: string = req?.body?.issues as string;
  if (!reservationRequest) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'reservationRequest is required to start inspect reservation',
    );
  }
  const result = await invoiceServices.inspectionReport({
    user: auth?._id,
    reservationRequest,
    issues,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'inspection issues has updated successfully',
    data: result,
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
    const status = req?.query?.status as TAssignedTaskType;

    if (!assignedTaskTypeArray.some((each) => each === status)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `status must be any of ${assignedTaskTypeArray.reduce(
          (total, current) => {
            total = total + `${current}, `;
            return total;
          },
          '',
        )}`,
      );
    }
    const result = await invoiceServices.getAllAssignedTasksByEngineer({
      status,
      user: auth?._id,
    });
    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'all task are retrieved successfully',
      data: result,
    });
  },
);

const getTodayTasksSummary: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  checkUserAccessApi({
    auth,
    accessUsers: ['serviceProviderEngineer'],
  });

  const result = await invoiceServices.getTodayTasksSummary(auth?._id);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'No task data found for today');
  }

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Today’s task summary retrieved successfully',
    data: result,
  });
});

export const invoiceController = {
  addAdditionalProducts, //service provider app->rservation->maintenance->details
  inspection, //service provider app->rservation->maintenance
  startInspection,
  inspectionReport,
  changeStatusToCompleted,
  getAllInvoices, //service provider app->engineer app->Invoices->All invoices
  getAllInvoicesByUser, //service provider app ->engineer app->Invoices->All invoices
  getAllAssignedTasksByEngineer, //service provider app->rservation->maintenance->assigned task
  getTodayTasksSummary, //service provider app->Team->Member Details->User detaisls-tasks
};

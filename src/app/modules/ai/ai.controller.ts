import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { TThreshold } from './ai.interface';
import { aiServices } from './ai.service';
import { TAuth } from '../../interface/error';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import AppError from '../../errors/AppError';

const addThreshold: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });

  // send response
  const thresholdData = req?.body as TThreshold;
  const result = await aiServices.addThreshold({ thresholdData });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'threshold data has been added successfully',
    data: result,
  });
});

const aiPerformance: RequestHandler = catchAsync(async (req, res) => {
  const result = await aiServices.aiPerformance();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'aai performance data has retrieved successfully',
    data: result,
  });
});

const getAiData: RequestHandler = catchAsync(async (req, res) => {
  const result = await aiServices.getAiData();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ai data has retrieved successfully',
    data: result,
  });
});

const getThresholds: RequestHandler = catchAsync(async (req, res) => {
  const result = await aiServices.getThresholds();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'threshold data has retrieved successfully',
    data: result,
  });
});
const getMaintenanceDueByMachine: RequestHandler = catchAsync(
  async (req, res) => {
    const auth: TAuth = req?.headers?.auth as unknown as TAuth;

    checkUserAccessApi({ auth, accessUsers: 'all' });

    const machine = req?.query?.machine as string;
    if (!machine) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'machine is required to get maintenance due',
      );
    }
    const result = await aiServices.getMaintenanceDueByMachine(machine);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'maintenance due in days has retrieved successfully',
      data: result,
    });
  },
);
const getLifeCycleByMachine: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  checkUserAccessApi({ auth, accessUsers: 'all' });

  const machine = req?.query?.machine as string;
  if (!machine) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'machine is required to get maintenance life cycle',
    );
  }
  const result = await aiServices.getLifeCycleByMachine(machine);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'maintenance due in days has retrieved successfully',
    data: result,
  });
});
const getMachineBadSections: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  checkUserAccessApi({ auth, accessUsers: 'all' });

  const machine = req?.query?.machine as string;
  if (!machine) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "machine is required to get machine's bad sections",
    );
  }
  const result = await aiServices.getMachineBadSections(machine);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'machine bad section names have retrieved successfully',
    data: result,
  });
});
export const aiController = {
  addThreshold,
  aiPerformance,
  getAiData,
  getThresholds,
  getMaintenanceDueByMachine,
  getLifeCycleByMachine,
  getMachineBadSections,
};

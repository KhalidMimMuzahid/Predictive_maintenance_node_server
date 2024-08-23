import { RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { TThreshold } from './ai.interface';
import { aiServices } from './ai.service';
import { TAuth } from '../../interface/error';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';

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

const getThresholds: RequestHandler = catchAsync(async (req, res) => {
  const result = await aiServices.getThresholds();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'threshold data has retrieved successfully',
    data: result,
  });
});

export const aiController = {
  addThreshold,
  getThresholds,
};

import { Request, RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { extraDataServices } from './extraData.service';
import sendResponse from '../../utils/sendResponse';
import { cronFunctions } from '../../utils/cronFunctions/cronFunctions';

const deleteMyAccount: RequestHandler = catchAsync(async (req, res) => {
  const emailOrPhone: string = req?.query?.emailOrPhone as string;
  if (!emailOrPhone) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'emailOrPhone is required to delete your account',
    );
  }

  const results = await extraDataServices.deleteMyAccount(emailOrPhone);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Request for deleting Your account has sent successfully',
    data: results,
  });
});

// those router is only for testings
const sendIotDataAiServer: RequestHandler = catchAsync(async (req, res) => {
  const result = await cronFunctions.sendIotDataToAIServer();
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'success',
    data: result,
  });
});

const uploadPhoto: RequestHandler = catchAsync(async (req, res) => {
  // const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  // const { fileName, fileType, file, folder } = req.body;
  // const fileName = req?.query?.fileName as string;
  // const fileType = req?.query?.fileType as string;
  const folder = (req?.query?.folder as string) || 'photos';

  if (!folder) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'folder are required to upload file',
    );
  }

  // req?.files?.file
  // const file = req?.files;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newReq = req as Request & { files: any };
  const file = newReq?.files?.file;
  const result = await extraDataServices.uploadPhoto({
    file,
    folder,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reservation image uploaded successfully',
    data: result,
  });
});
export const extraDataController = {
  deleteMyAccount,
  sendIotDataAiServer,
  uploadPhoto,
};

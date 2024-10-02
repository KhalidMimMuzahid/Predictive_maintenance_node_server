import { Request, RequestHandler } from 'express';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { extraDataServices } from './extraData.service';
import sendResponse from '../../utils/sendResponse';
import { cronFunctions } from '../../utils/cronFunctions/cronFunctions';
import { TAuth } from '../../interface/error';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import { TFeedback, TInviteMember } from './extraData.interface';

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
const addFeedback: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  checkUserAccessApi({ auth, accessUsers: 'all' });
  const feedback = req?.body as Partial<TFeedback>;
  const result = await extraDataServices.addFeedback({
    user: auth?._id,
    feedback,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'feedback has added successfully',
    data: result,
  });
});
const createCoupon: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });

  const numberOfCouponString = req?.query?.numberOfCoupon as string;
  const numberOfCoupon = parseInt(numberOfCouponString);

  const subscription = req?.query?.subscription as string;
  const expireInString = req?.query?.expireIn as string;
  if (!numberOfCoupon || !subscription || !expireInString) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'numberOfCoupon, subscription and expireIn are required to create coupon',
    );
  }

  const expireIn = new Date(expireInString);
  if (!expireIn?.getTime()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'expireIn must be a valid date string',
    );
  }
  if (expireIn < new Date()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'expireIn cannot be previous date',
    );
  }

  const result = await extraDataServices.createCoupon({
    numberOfCoupon,
    subscription,
    expireIn,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'coupon has created successfully',
    data: result,
  });
});
const inviteMember: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  checkUserAccessApi({
    auth,
    accessUsers: ['showaAdmin', 'serviceProviderAdmin'],
  });
  const inviteMember = req?.body?.data as Partial<TInviteMember>;

  if (inviteMember?.type === 'showaUser') {
    delete inviteMember.serviceProviderAdmin;
    delete inviteMember.serviceProviderEngineer;
    delete inviteMember.serviceProviderBranchManager;
  }
  if (inviteMember?.type === 'serviceProviderAdmin') {
    delete inviteMember.showaUser;
    delete inviteMember.serviceProviderEngineer;
    delete inviteMember.serviceProviderBranchManager;
  }
  if (inviteMember?.type === 'serviceProviderEngineer') {
    delete inviteMember.showaUser;
    delete inviteMember.serviceProviderAdmin;
    delete inviteMember.serviceProviderBranchManager;
  }
  if (inviteMember?.type === 'serviceProviderBranchManager') {
    delete inviteMember.showaUser;
    delete inviteMember.serviceProviderAdmin;
    delete inviteMember.serviceProviderEngineer;
  }

  const result = await extraDataServices.inviteMember({
    inviteMember,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'invitation has sent successfully',
    data: result,
  });
});

const invitedMemberById: RequestHandler = catchAsync(async (req, res) => {
  const invitedMember: string = req?.query?.invitedMember as string;

  const result = await extraDataServices.invitedMemberById(invitedMember);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'invited member has retrieved successfully',
    data: result,
  });
});
const invitedMemberByEmail: RequestHandler = catchAsync(async (req, res) => {
  const email: string = req?.query?.email as string;

  const result = await extraDataServices.invitedMemberByEmail(email);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'invited member has retrieved successfully',
    data: result,
  });
});
const reviewFeedback: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  checkUserAccessApi({ auth, accessUsers: ['showaAdmin', 'showaSubAdmin'] });
  const feedback = req?.query?.feedback as string;
  if (!feedback) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'feedback  is required to reviewed feedback',
    );
  }
  const result = await extraDataServices.reviewFeedback(feedback);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'feedback has reviewed successfully',
    data: result,
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
  addFeedback,
  createCoupon,
  inviteMember,
  invitedMemberById,
  invitedMemberByEmail,
  reviewFeedback,
  sendIotDataAiServer,
  uploadPhoto,
};

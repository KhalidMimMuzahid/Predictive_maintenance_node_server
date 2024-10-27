import { Request, RequestHandler } from 'express';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TAuth } from '../../interface/error';
import catchAsync from '../../utils/catchAsync';
import { checkUserAccessApi } from '../../utils/checkUserAccessApi';
import { cronFunctions } from '../../utils/cronFunctions/cronFunctions';
import sendResponse from '../../utils/sendResponse';
import { TFaq, TFeedback, TInviteMember } from './extraData.interface';
import { extraDataServices } from './extraData.service';

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
    data: null,
    exceptional: {
      type: 'sendingFile',
      sendingFile: {
        extension: 'csv',
        file: result,
      },
    },
  });
});

const activateCoupon: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  checkUserAccessApi({ auth, accessUsers: 'all' });

  const coupon = req?.query?.coupon as string;
  if (!coupon) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'coupon is required to activate coupon',
    );
  }

  const result = await extraDataServices.activateCoupon({
    coupon,
    auth,
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

// const createFaq: RequestHandler = catchAsync(async (req, res) => {
//   const auth: TAuth = req?.headers?.auth as unknown as TAuth;
//   checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });

//   const { title, type, answer } = req.body as TFaq;

//   if (!title || !type || !answer) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'Title, type, and answer are required',
//     );
//   }

//   const result = await extraDataServices.createFaq({
//     title,
//     type,
//     answer,
//   });
//   // Send the response
//   sendResponse(res, {
//     statusCode: httpStatus.CREATED, // Use 201 for created resources
//     success: true,
//     message: 'FAQ has been created successfully',
//     data: result,
//   });
// });

const createFaq: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });

  const { title, type, answer } = req.body as TFaq;

  // Validate required fields
  if (!title || !type || !answer) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Title, type, and answer are required',
    );
  }

  const allowedTypes = ['app', 'service', 'security'];
  if (!allowedTypes.includes(type)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `FAQ type must be one of the following: ${allowedTypes.join(', ')}`,
    );
  }

  const result = await extraDataServices.createFaq({
    title,
    type,
    answer,
  });

  // Send the response
  sendResponse(res, {
    statusCode: httpStatus.CREATED, // Use 201 for created resources
    success: true,
    message: 'FAQ has been created successfully',
    data: result,
  });
});

const getAllFaq: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  checkUserAccessApi({ auth, accessUsers: 'all' });

  const result = await extraDataServices.getAllFaq();

  // Send the response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'FAQs retrieved successfully',
    data: result,
  });
});

const editFaq: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });

  const faqId: string = req?.query?.faqId as string;

  const { title, type, answer } = req.body as TFaq;

  if (!faqId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'FAQ id is required');
  }

  if (!title || !type || !answer) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Title, FAQ type, and answer are required',
    );
  }

  const allowedTypes = ['app', 'service', 'security'];
  if (!allowedTypes.includes(type)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `FAQ type must be one of the following: ${allowedTypes.join(', ')}`,
    );
  }

  const result = await extraDataServices.editFaq(faqId, {
    title,
    type,
    answer,
  });

  // Send the response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'FAQ has been updated successfully',
    data: result,
  });
});

const deleteFaq: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin'] });

  const faqId: string = req.query.faqId as string;

  if (!faqId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'FAQ id is required');
  }

  const deletedFaq = await extraDataServices.deleteFaq(faqId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'FAQ has been deleted successfully',
    data: deletedFaq,
  });
});

export const extraDataController = {
  deleteMyAccount,
  addFeedback,
  createCoupon,
  activateCoupon,
  inviteMember,
  invitedMemberById,
  invitedMemberByEmail,
  reviewFeedback,
  sendIotDataAiServer,
  uploadPhoto,
  createFaq,
  getAllFaq,
  editFaq,
  deleteFaq,
};

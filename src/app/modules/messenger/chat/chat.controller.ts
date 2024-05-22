import { RequestHandler } from 'express';
import catchAsync from '../../../utils/catchAsync';
import { TChat } from './chat.interface';
import { chatServices } from './chat.service';
import sendResponse from '../../../utils/sendResponse';
import httpStatus from 'http-status';
import { TAuth } from '../../../interface/error';

const createPersonalChat: RequestHandler = catchAsync(async (req, res) => {
  const personalChatData: Partial<TChat> = req.body as Partial<TChat>;

  const result = await chatServices.createPersonalChat(personalChatData);
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Personal chat has created successfully',
    data: result,
  });
});
const createGroupChat: RequestHandler = catchAsync(async (req, res) => {
  const groupChatData: Partial<TChat> = req.body as Partial<TChat>;

  const users = groupChatData?.users;
  const group = groupChatData?.group || {};
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;
  // console.log(groupChatData);
  // console.log(auth);
  group.groupAdmin = auth._id;
  const result = await chatServices.createGroupChat({ users, group });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Group chat has created successfully',
    data: result,
  });
});
export const chatController = {
  createPersonalChat,
  createGroupChat,
};

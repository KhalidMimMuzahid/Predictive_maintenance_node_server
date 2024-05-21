import { RequestHandler } from 'express';
import catchAsync from '../../../utils/catchAsync';
import { TChat } from './chat.interface';
import { chatServices } from './chat.service';
import sendResponse from '../../../utils/sendResponse';
import httpStatus from 'http-status';

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

export const chatController = {
  createPersonalChat,
};

import { RequestHandler } from 'express';

import httpStatus from 'http-status';
import catchAsync from '../../../utils/catchAsync';
import { TMessage } from './message.interface';
import sendResponse from '../../../utils/sendResponse';
import { TAuth } from '../../../interface/error';
import { messageServices } from './message.service';
import AppError from '../../../errors/AppError';

const sendMessage: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  const chat: string = req?.query?.chat as string;
  if (!chat) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'chat is required to send message',
    );
  }

  const messageData: Partial<TMessage> = req.body as Partial<TMessage>;
  if (!messageData[`${messageData?.type}`]) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `${
        messageData[`${messageData?.type}`]
      } is required to send ${messageData?.type}`,
    );
  }
  const result = await messageServices.sendMessage({
    messageData,
    chat,
    sender: auth._id,
    req,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'message sent successfully',
    data: result,
  });
});
const getMessagesByChat: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  const chat: string = req?.query?.chat as string;
  if (!chat) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'chat is required to get messages',
    );
  }

  const result = await messageServices.getMessagesByChat({
    chat,
    requester: auth._id,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'messages has retrieved successfully',
    data: result,
  });
});
const getLastMessageByChat: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  const chat: string = req?.query?.chat as string;
  if (!chat) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'chat is required to get last messages',
    );
  }

  const result = await messageServices.getLastMessageByChat({
    chat,
    requester: auth._id,
  });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'last messages has retrieved successfully',
    data: result,
  });
});
export const messageController = {
  sendMessage,
  getMessagesByChat,
  getLastMessageByChat,
};

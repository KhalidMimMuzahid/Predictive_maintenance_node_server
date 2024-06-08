import { TMessage } from './message.interface';
import mongoose from 'mongoose';
import { Message } from './message.model';
import { Chat } from '../chat/chat.model';
import AppError from '../../../errors/AppError';
import httpStatus from 'http-status';

const sendMessage = async ({
  messageData,
  chat,
  sender,
}: {
  messageData: Partial<TMessage>;

  chat: string;
  sender: mongoose.Types.ObjectId;
}) => {
  const chatData = await Chat.findById(chat);
  if (!chatData) {
    throw new AppError(httpStatus.BAD_REQUEST, `chat is not found`);
  }

  console.log({ sender });
  if (
    !chatData?.users?.some((each) => each?.toString() === sender?.toString())
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `you are not a member of this chat`,
    );
  }
  const message = await Message.create({
    chat: new mongoose.Types.ObjectId(chat),
    type: messageData?.type,
    sender: sender,

    [`${messageData?.type}`]: messageData[`${messageData?.type}`],
  });

  return message;
};

const getMessagesByChat = async ({
  chat,
  requester,
}: {
  chat: string;
  requester: mongoose.Types.ObjectId;
}) => {
  const chatData = await Chat.findById(chat);
  if (!chatData) {
    throw new AppError(httpStatus.BAD_REQUEST, `chat is not found`);
  }

  if (
    !chatData?.users?.some((each) => each?.toString() === requester?.toString())
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `you are not a member of this chat`,
    );
  }

  const messages = await Message.find({
    chat: new mongoose.Types.ObjectId(chat),
  });

  return messages;
};
const getLastMessageByChat = async ({
  chat,
  requester,
}: {
  chat: string;
  requester: mongoose.Types.ObjectId;
}) => {
  const chatData = await Chat.findById(chat);
  if (!chatData) {
    throw new AppError(httpStatus.BAD_REQUEST, `chat is not found`);
  }

  if (
    !chatData?.users?.some((each) => each?.toString() === requester?.toString())
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `you are not a member of this chat`,
    );
  }

  const message = await Message.findOne({
    chat: new mongoose.Types.ObjectId(chat),
  })
    .select('message seenBy type event file createdAt')
    .sort({ _id: -1 });

  return message;
};
export const messageServices = {
  sendMessage,
  getMessagesByChat,
  getLastMessageByChat,
};

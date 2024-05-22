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
export const messageServices = {
  sendMessage,
};

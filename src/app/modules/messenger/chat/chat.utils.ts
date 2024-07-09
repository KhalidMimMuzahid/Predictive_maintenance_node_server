import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { Message } from '../message/message.model';
import mongoose from 'mongoose';
import { Chat } from './chat.model';
import { TAddingMember } from '../message/message.interface';

export const createPersonalChatFunc = async ({
  user1,
  user2,
  users,
}: {
  user1: string;
  user2: string;
  users: string[];
}) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const personalChatArray = await Chat.create(
      [
        {
          users: users?.map((each) => new mongoose.Types.ObjectId(each)),
        },
      ],
      {
        session: session,
      },
    );

    if (!personalChatArray?.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to create chat');
    }

    const personalChat = personalChatArray[0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event: any = {};
    event.type = 'addingMember';
    const addingMember: Partial<TAddingMember> = {};
    addingMember.addedByUser = new mongoose.Types.ObjectId(user1);
    addingMember.addedUser = new mongoose.Types.ObjectId(user2);
    event.addingMember = addingMember;

    const eventMessage = {
      chat: personalChat?._id,
      event,
      type: 'event',
    };

    const createdMessagesArray = await Message.create([eventMessage], {
      session: session,
    });

    if (!createdMessagesArray?.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not create chat, please try again',
      );
    }

    await session.commitTransaction();
    await session.endSession();

    return personalChat;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { User } from '../../user/user.model';
import { TChat } from './chat.interface';
import { Chat } from './chat.model';
import mongoose from 'mongoose';
import { Message } from '../message/message.model';
import { hadDuplicateValue } from '../../../utils/hadDuplicateValue';

const createPersonalChat = async (personalChatData: Partial<TChat>) => {
  const { users } = personalChatData;
  const user1 = users[0];
  const user2 = users[1];

  const isUser1Exists = await User.findById(user1);
  if (!isUser1Exists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `No user found with this _id: ${users[0]}`,
    );
  }
  const isUser2Exists = await User.findById(user2);
  if (!isUser2Exists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `No user found with this _id: ${users[1]}`,
    );
  }

  // check those user has already been connected or not

  const areTheyAlreadyConnected = await Chat.findOne({
    users: { $all: users?.map((each) => new mongoose.Types.ObjectId(each)) },
    'group.groupAdmin': { $exists: false },
  });
  if (areTheyAlreadyConnected) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Those user has already been connected personally`,
    );
  }
  //implement session here cause we need to create event message ("You are connected at Date") here

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

    const messageArray = await Message.create(
      [
        {
          chat: personalChat?._id,
          event: 'You are connected now',
          type: 'event',
        },
      ],
      {
        session: session,
      },
    );

    if (!messageArray?.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to create chat');
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
const createGroupChat = async (groupChatData: Partial<TChat>) => {
  const { group } = groupChatData;

  const users: string[] = groupChatData?.users as unknown as string[];
  if (hadDuplicateValue(users)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Users has some duplicate values',
    );
  }

  // we are forcefully adding this group admin as a group member
  if (!users.some((each) => each === group.groupAdmin?.toString())) {
    users.push(group.groupAdmin?.toString());
  } else {
    if (users?.length === 2) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Users must have at least two values excluding group admin',
      );
    }
  }

  // console.log({ users, group });
  const usersData = await User.find().where('_id').in(users);

  if (usersData?.length !== users.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Some of the users has not been found',
    );
  }

  //implement session here cause we need to create event message ("You are connected at Date") here

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const groupChatArray = await Chat.create(
      [
        {
          users: users?.map((each) => new mongoose.Types.ObjectId(each)),
          group,
        },
      ],
      {
        session: session,
      },
    );

    if (!groupChatArray?.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to create chat');
    }

    const groupChat = groupChatArray[0];

    const messageArray = await Message.create(
      [
        {
          chat: groupChat?._id,
          event: 'Group has created successfully',
          type: 'event',
        },
      ],
      {
        session: session,
      },
    );

    if (!messageArray?.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to create chat');
    }

    await session.commitTransaction();
    await session.endSession();

    return groupChat;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};
export const chatServices = {
  createPersonalChat,
  createGroupChat,
};

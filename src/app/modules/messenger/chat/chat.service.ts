import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { User } from '../../user/user.model';
import { TChat } from './chat.interface';
import { Chat } from './chat.model';
import mongoose from 'mongoose';
import { Message } from '../message/message.model';
import { hadDuplicateValue } from '../../../utils/hadDuplicateValue';
import { TAddingMember, TCreatingGroup } from '../message/message.interface';
import { createPersonalChatFunc } from './chat.utils';

const createPersonalChat = async ({
  user1,
  user2,
}: {
  user1: string;
  user2: string;
}) => {
  if (user1 === user2) {
    throw new AppError(httpStatus.BAD_REQUEST, `You can not add yourself`);
  }
  const isUser1Exists = await User.findById(user1);
  if (!isUser1Exists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `No user found with this _id: ${user1}`,
    );
  }
  const isUser2Exists = await User.findById(user2);
  if (!isUser2Exists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `No user found with this _id: ${user2}`,
    );
  }

  // check those user has already been connected or not
  const users = [user1, user2];
  const areWeAlreadyConnected = await Chat.findOne({
    users: {
      $all: users?.map((each) => new mongoose.Types.ObjectId(each)),
    },
    'group.groupAdmin': { $exists: false },
  });
  if (areWeAlreadyConnected) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You are already been connected personally each other`,
    );
  }
  //implement session here cause we need to create event message ("You are connected at Date") here

  const result = createPersonalChatFunc({
    user1,
    user2,
    users,
  });

  return result;
};

const createPersonalChatByPhoneOrEmail = async ({
  user1,
  phoneOrEmail,
}: {
  user1: string;
  phoneOrEmail: string;
}) => {

  const user2Data = await User.findOne({
    $or: [{ email: phoneOrEmail }, { phone: `+${phoneOrEmail.substring(1)}` }],
  }).select('_id email phone');

  const user2 = user2Data?._id?.toString();

  if (!user2) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `No user found with this ${phoneOrEmail}`,
    );
  }

  if (user1 === user2) {
    throw new AppError(httpStatus.BAD_REQUEST, `You can not add yourself`);
  }
  const isUser1Exists = await User.findById(user1);
  if (!isUser1Exists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `No user found with this _id: ${user1}`,
    );
  }

  // check those user has already been connected or not
  const users = [user1, user2];
  const areWeAlreadyConnected = await Chat.findOne({
    users: {
      $all: users?.map((each) => new mongoose.Types.ObjectId(each)),
    },
    'group.groupAdmin': { $exists: false },
  });
  if (areWeAlreadyConnected) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You are already been connected personally each other`,
    );
  }
  //implement session here cause we need to create event message ("You are connected at Date") here

  const result = createPersonalChatFunc({
    user1,
    user2,
    users,
  });

  return result;
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

    // we need to create event type message for creating group and adding members

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let eventMessages: any[] = [];

    eventMessages = users?.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const event: any = {};
      event.type = 'addingMember';
      const addingMember: Partial<TAddingMember> = {};
      addingMember.addedByUser = group.groupAdmin;
      addingMember.addedUser = new mongoose.Types.ObjectId(user);
      event.addingMember = addingMember;

      return {
        chat: groupChat?._id,
        event,
        type: 'event',
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event: any = {};
    event.type = 'creatingGroup';
    const creatingGroup: Partial<TCreatingGroup> = {};
    creatingGroup.createdByUser = group.groupAdmin;
    event.creatingGroup = creatingGroup;

    eventMessages.unshift({
      chat: groupChat?._id,
      event,
      type: 'event',
    });
    const createdMessagesArray = await Message.create(eventMessages, {
      session: session,
    });

    if (createdMessagesArray?.length !== users?.length + 1) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not create chat, please try again',
      );
    }

    // const messageArray = await Message.create(
    //   [
    //     {
    //       chat: groupChat?._id,
    //       event: 'Group has created successfully',
    //       type: 'event',
    //     },
    //   ],
    //   {
    //     session: session,
    //   },
    // );

    // if (!messageArray?.length) {
    //   throw new AppError(httpStatus.BAD_REQUEST, 'failed to create chat');
    // }

    await session.commitTransaction();
    await session.endSession();

    return groupChat;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};
const getMyAllChats = async (user: mongoose.Types.ObjectId) => {
  const result = await Chat.find({
    users: user,
  }).populate([
    {
      path: 'reservationRequests',
      options: { strictPopulate: false },
    },
  ]);
  return result;
};
const getChatByChat_id = async ({
  user,
  chat_id,
}: {
  user: mongoose.Types.ObjectId;
  chat_id: string;
}) => {
  const result = await Chat.findOne({
    _id: chat_id,
    users: user,
  }).populate([
    {
      path: 'reservationRequests',
      options: { strictPopulate: false },
    },
  ]);

  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `no chat found for this chat_id`,
    );
  }
  return result;
};
export const chatServices = {
  createPersonalChat,
  createPersonalChatByPhoneOrEmail,
  createGroupChat,
  getMyAllChats,
  getChatByChat_id,
};

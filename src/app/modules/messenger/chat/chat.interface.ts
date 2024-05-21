import { Types } from 'mongoose';

export type TGroup = {
  groupName?: string;
  groupPhotoUrl?: string;
  groupAdmin?: Types.ObjectId;
};
export type TChat = {
  group: TGroup;
  users: Types.ObjectId[];
};

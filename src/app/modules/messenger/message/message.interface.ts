import { Types } from 'mongoose';

export type TFile = {
  fileUrl: string;
  fileName: string;
  extension: string;
};
export type TMessage = {
  chat: Types.ObjectId;
  sender?: Types.ObjectId; // its optional only for event type message
  type: 'message' | 'event' | 'file'; // event is like "Robin add Khalid", "Khalid has left the group" etc
  message?: string;
  event: string;
  file?: TFile;
  seenBy?: Types.ObjectId[];

  deletedBy?: Types.ObjectId[];
  isDeletedFromEveryOne: boolean;
  isForwarded: boolean;
};

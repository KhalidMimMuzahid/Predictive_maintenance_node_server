import mongoose, { Types } from 'mongoose';

export type TFile = {
  fileUrl: string;
  fileName: string;
  extension: string;
};

export type TAddingMember = {
  addedByUser: mongoose.Types.ObjectId;
  addedUser: mongoose.Types.ObjectId;
};
export type TRemovingMember = {
  removedByUser: mongoose.Types.ObjectId;
  removedUser: mongoose.Types.ObjectId;
};
export type TCreatingGroup = {
  createdByUser: mongoose.Types.ObjectId;
};
export type TEvent = {
  type: 'creatingGroup' | 'addingMember' | 'removingMember';
  creatingGroup: TCreatingGroup;
  addingMember: TAddingMember;
  removingMember: TRemovingMember;
};
export type TMessage = {
  chat: Types.ObjectId;
  sender?: Types.ObjectId; // its optional only for event type message
  type: 'message' | 'event' | 'file'; // event is like "Robin add Khalid", "Khalid has left the group" etc
  message?: string;
  event: TEvent;
  file?: TFile;
  seenBy?: Types.ObjectId[];

  deletedBy?: Types.ObjectId[];
  isDeletedFromEveryOne: boolean;
  isForwarded: boolean;
};

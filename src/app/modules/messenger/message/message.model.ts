import mongoose, { Schema } from 'mongoose';
import {
  TAddingMember,
  TCreatingGroup,
  TEvent,
  TFile,
  TMessage,
  TRemovingMember,
} from './message.interface';

const FileSchema: Schema = new Schema<TFile>({
  fileUrl: { type: 'string', required: true },
  fileName: { type: 'string', required: true },
  extension: { type: 'string', required: true },
});
const TCreatingGroupSchema = new Schema<TCreatingGroup>({
  createdByUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const TAddingMemberSchema = new Schema<TAddingMember>({
  addedByUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  addedUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const TRemovingMemberSchema = new Schema<TRemovingMember>({
  removedByUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  removedUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});
const TEventSchema = new Schema<TEvent>({
  type: {
    type: String,
    enum: ['creatingGroup', 'addingMember', 'removingMember'],
    required: true,
  },
  creatingGroup: {
    type: TCreatingGroupSchema,
    required: function () {
      return this.type === 'creatingGroup';
    },
  },
  addingMember: {
    type: TAddingMemberSchema,
    required: function () {
      return this.type === 'addingMember';
    },
  },
  removingMember: {
    type: TRemovingMemberSchema,
    required: function () {
      return this.type === 'removingMember';
    },
  },
});
const MessageSchema: Schema = new Schema<TMessage>(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    isForwarded: { type: Boolean, required: true, default: false },
    message: {
      type: String,
      required: function () {
        return this.type === 'message';
      },
    },
    event: {
      type: TEventSchema,
      required: function () {
        return this.type === 'event';
      },
    },
    file: {
      type: FileSchema,
      required: function () {
        return this.type === 'file';
      },
    },
    seenBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    deletedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isDeletedFromEveryOne: { type: Boolean, require: true, default: false },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['message', 'event', 'file'],
      required: true,
      default: 'message',
    },
  },
  {
    timestamps: true,
  },
);
export const Message = mongoose.model<TMessage>('Message', MessageSchema);

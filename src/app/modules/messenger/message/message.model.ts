import mongoose, { Schema } from 'mongoose';
import { TFile, TMessage } from './message.interface';

const FileSchema: Schema = new Schema<TFile>({
  fileName: { type: 'string', required: true },
  extension: { type: 'string', required: true },
});
const MessageSchema: Schema = new Schema<TMessage>(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    isForwarded: { type: Boolean, required: true, default: false },
    message: { type: String },
    event: { type: String },
    file: { type: FileSchema },
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

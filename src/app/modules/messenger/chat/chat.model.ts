import mongoose, { Schema } from 'mongoose';
import { TChat, TGroup } from './chat.interface';

const GroupSchema = new Schema<TGroup>({
  groupAdmin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  groupName: {
    type: String,
  },
  groupPhotoUrl: {
    type: String,
  },
});
const ChatSchema: Schema = new Schema<TChat>(
  {
    group: { type: GroupSchema }, // if this chat have group.groupAdmin  means this chat is group chat
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  },
);
export const Chat = mongoose.model<TChat>('Chat', ChatSchema);

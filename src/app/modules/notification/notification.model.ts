import mongoose, { Schema } from 'mongoose';
import { TNotification } from './notification.interface';

const NotificationSchema = new Schema<TNotification>({
  type: {
    type: String,
    enum: ['announcement'],
    required: true,
  },

  announcement: {
    type: Schema.Types.Mixed,
    required: false,
  },

  receivers: {
    type: [String],
    required: true,
  },
});

NotificationSchema.pre('find', function (next) {
  this.find({ 'isDeleted.value': { $ne: true } });
  next();
});

export const Notification = mongoose.model<TNotification>(
  'Subscription',
  NotificationSchema,
);

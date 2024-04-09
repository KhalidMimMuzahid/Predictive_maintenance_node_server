import { Schema } from 'mongoose';
import { TAttachedSensor } from './sensorAttached.interface';

export const AttachedSensorSchema: Schema = new Schema<TAttachedSensor>({
  sensor: { type: Schema.Types.ObjectId, ref: 'Sensor', required: true },
  machine: { type: Schema.Types.ObjectId, ref: 'Machine' },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  purpose: { type: String },
  sectionName: { type: String },
  isSwitchedOn: { type: Boolean, required: true },
  currentSubscription: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true,
  },

  module: {
    type: String,
    enum: ['module-1', 'module-2', 'module-3', 'module-4'],
    required: true,
  },
  sensorData: [Schema.Types.Mixed],
});

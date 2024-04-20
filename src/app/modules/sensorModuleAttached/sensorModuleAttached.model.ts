import mongoose, { Schema } from 'mongoose';
import { TSensorModuleAttached } from './sensorModuleAttached.interface';

const SensorModuleAttachedSchema: Schema = new Schema<TSensorModuleAttached>({
  sensorModule: { type: Schema.Types.ObjectId, ref: 'Sensor', required: true },
  machine: { type: Schema.Types.ObjectId, ref: 'Machine' },
  macAddress: { type: String, unique: true, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  purpose: { type: String },
  sectionName: { type: String },
  isSwitchedOn: { type: Boolean, required: true },
  currentSubscription: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
    // required: true,
  },

  moduleType: {
    type: String,
    enum: ['module-1', 'module-2', 'module-3', 'module-4'],
    required: true,
  },
  sensorData: [Schema.Types.Mixed],
});

export const SensorModuleAttached = mongoose.model<TSensorModuleAttached>(
  'SensorModuleAttached',
  SensorModuleAttachedSchema,
);

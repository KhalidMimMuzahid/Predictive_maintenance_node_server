import mongoose, { Schema } from 'mongoose';
import {
  TModule,
  TSensorModuleAttached,
} from './sensorModuleAttached.interface';

const SensorModuleAttachedSchema: Schema = new Schema<TSensorModuleAttached>(
  {
    sensorModule: {
      type: Schema.Types.ObjectId,
      ref: 'Sensor',
      required: true,
    },
    isAttached: { type: Boolean, required: true, default: false },
    machine: { type: Schema.Types.ObjectId, ref: 'Machine' },
    macAddress: { type: String, unique: true, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    purpose: { type: String },
    sectionName: { type: String, required: true },
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
    sensorData: [
      {
        type: new mongoose.Schema<TModule>(
          { vibration: [Number], temperature: [Number] },
          {
            timestamps: true,
          },
        ),
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const SensorModuleAttached = mongoose.model<TSensorModuleAttached>(
  'SensorModuleAttached',
  SensorModuleAttachedSchema,
);

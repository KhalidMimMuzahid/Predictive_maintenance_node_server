import mongoose, { Schema } from 'mongoose';
import {
  TModule,
  TSectionName,
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

    isSwitchedOn: { type: Boolean, required: true },

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
    sectionName: {
      type: new mongoose.Schema<TSectionName>(
        {
          vibration: [String],
          temperature: [String],
        },
        {
          timestamps: false,
        },
      ),

      required: true,
    },

    subscriptionPurchased: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPurchased',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const SensorModuleAttached = mongoose.model<TSensorModuleAttached>(
  'SensorModuleAttached',
  SensorModuleAttachedSchema,
);

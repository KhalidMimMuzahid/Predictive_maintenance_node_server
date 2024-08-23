import mongoose, { Schema } from 'mongoose';
import { TAI, TAiData, TThreshold } from './ai.interface';
import {
  THealthStatuses,
  TModule,
  TSectionName,
} from '../sensorModuleAttached/sensorModuleAttached.interface';

const ThresholdSchema: Schema = new Schema<TThreshold>(
  {
    sectionName: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    temperature: {
      type: Number,
      required: false,
    },
    vibrations: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const AISchema = new Schema<TAI>({
  type: {
    type: String,
    enum: ['threshold'],
    required: true,
  },
  threshold: {
    type: ThresholdSchema,
    required: false,
  },
  aiData: {
    type: new Schema<TAiData>(
      {
        sensorModuleAttached: {
          type: Schema.Types.ObjectId,
          ref: 'SensorModuleAttached',
          required: true,
        },
        moduleType: {
          type: String,
          enum: ['module-1', 'module-2', 'module-3', 'module-4'],
          required: true,
        },
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
        healthStatuses: {
          type: new Schema<THealthStatuses>(
            {
              temperature: [String],
              vibration: [String],
            },
            {
              timestamps: false,
            },
          ),
          required: false,
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
        timestamps: false,
      },
    ),
  },
});

export const AI = mongoose.model<TAI>('AI', AISchema);

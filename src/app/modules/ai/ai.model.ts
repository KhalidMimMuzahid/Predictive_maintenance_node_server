import mongoose, { Schema } from 'mongoose';
import { TAI, TAiData, TMachineForAI, TThreshold } from './ai.interface';

const ThresholdSchema: Schema = new Schema<TThreshold>(
  {
    category: {
      type: String,
      enum: ['washing-machine', 'general-machine'],
      required: true,
    },
    type: { type: String },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    sectionName: {
      type: String,
      trim: true,
      required: true,
      // unique: true,
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

const AISchema = new Schema<TAI>(
  {
    type: {
      type: String,
      enum: ['threshold', 'aiData', 'machine'],
      required: true,
    },
    threshold: {
      type: ThresholdSchema,
      required: false,
    },
    aiData: {
      type: new Schema<TAiData>(
        {
          machine: {
            type: Schema.Types.ObjectId,
            ref: 'Machine',
            required: true,
          },

          sectionName: {
            type: String,
            required: true,
          },
          healthStatus: {
            type: String,
            enum: ['bad', 'good', 'moderate', 'unknown'],
            required: false,
          },
          sensorData: {
            type: new mongoose.Schema(
              {
                vibration: { type: Number, required: true },
                temperature: { type: Number, required: true },
              },
              {
                _id: false,
              },
            ),
            required: true,
          },
        },
        {
          timestamps: false,
          _id: false,
        },
      ),
      required: false,
    },
    machine: {
      type: new Schema<TMachineForAI>(
        {
          lifeCycle: {
            type: new Schema(
              {
                totalCycle: Number,
                totalMachine: Number,
              },
              {
                timestamps: false,
                _id: false,
              },
            ),
          },
          reservationCycle: {
            type: new Schema(
              {
                totalCycle: Number,
                totalReservation: Number,
              },
              {
                timestamps: false,
                _id: false,
              },
            ),
          },
        },
        {
          timestamps: false,
          _id: false,
        },
      ),
      required: false,
    },
  },

  {
    timestamps: false,
  },
);

export const AI = mongoose.model<TAI>('AI', AISchema);

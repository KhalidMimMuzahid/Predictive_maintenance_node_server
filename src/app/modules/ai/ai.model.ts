import mongoose, { Schema } from 'mongoose';
import { TAI, TThreshold } from './ai.interface';

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
});

export const AI = mongoose.model<TAI>('AI', AISchema);

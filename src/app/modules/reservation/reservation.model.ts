import mongoose, { Schema } from 'mongoose';
import { TReservationRequest } from './reservation.interface';

const ReservationRequestSchema: Schema = new Schema<TReservationRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    requestId: { type: String, required: true },
    machine: { type: Schema.Types.ObjectId, ref: 'Machine', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'ongoing', 'completed', 'canceled'],
      required: true,
    },
    // date: { type: Date, required: true },
    // location: { type: AddressSchema, required: true }, // Assuming TAddress will be an object
    isSensorConnected: { type: Boolean, required: true },
    machineType: {
      type: String,
      enum: ['washing-machine', 'general-machine'],
      required: true,
    },
    problem: {
      issues: [String],
      problemDescription: String,
      images: [{ image: String, title: String }],
    },
    schedule: {
      category: {
        type: String,
        enum: [
          'on-demand',
          'within-one-week',
          'within-two-week',
          'custom-date-picked',
        ],
        required: true,
      },
      // date: { type: Date, required: true },
      schedules: [{ type: Date }],
    },
    reasonOfReSchedule: {
      type: String,
      required: false,
    },
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    reservationRequestGroup: {
      type: Schema.Types.ObjectId,
      ref: 'ReservationRequestGroup',
    },
  },
  {
    timestamps: true,
  },
);
export const ReservationRequest = mongoose.model<TReservationRequest>(
  'ReservationRequest',
  ReservationRequestSchema,
);

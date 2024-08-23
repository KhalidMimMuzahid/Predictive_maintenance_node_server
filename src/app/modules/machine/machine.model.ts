import mongoose, { Schema } from 'mongoose';
import {
  // AddressSchema,
  CompanySchema,
  IsDeletedSchema,
} from '../common/common.model';
import { TMachine } from './machine.interface';

export const MachineSchema: Schema = new Schema<TMachine>(
  {
    machineNo: { type: String, required: true },
    healthStatus: {
      type: String,
      enum: ['bad', 'good', 'moderate', 'unknown'],
      required: true,
    },
    packageStatus: {
      type: String,
      enum: ['Pending', 'Running', 'Expired'],
      default: 'Pending',
      required: true,
    },
    category: {
      type: String,
      enum: ['washing-machine', 'general-machine'],
      required: true,
    },
    name: { type: String, required: true },
    // address: { type: AddressSchema, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    usedFor: { type: CompanySchema, required: true },
    generalMachine: {
      homeName: { type: String },
      homeType: { type: String },
    },
    washingMachine: {
      type: { type: String },
    },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    environment: { type: String, enum: ['indoor', 'outdoor'], required: true },
    sensorModulesAttached: [
      { type: Schema.Types.ObjectId, ref: 'SensorModuleAttached' },
    ],

    subscriptionPurchased: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPurchased',
      required: true,
    },

    isDeleted: {
      type: IsDeletedSchema,
      required: true,
      default: { value: false },
    },
  },
  {
    timestamps: true,
  },
);

MachineSchema.pre('find', function (next) {
  this.find({ 'isDeleted.value': { $ne: true } });
  next();
});

MachineSchema.pre('findOne', function (next) {
  this.findOne({ 'isDeleted.value': { $ne: true } });
  next();
});

export const Machine = mongoose.model<TMachine>('Machine', MachineSchema);

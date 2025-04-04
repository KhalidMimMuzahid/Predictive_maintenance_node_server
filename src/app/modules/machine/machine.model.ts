import mongoose, { Schema } from 'mongoose';
import {
  // AddressSchema,
  CompanySchema,
  IsDeletedSchema,
} from '../common/common.model';
import { TCycleCount, TMachine } from './machine.interface';

export const MachineSchema: Schema = new Schema<TMachine>(
  {
    machineNo: { type: String, required: true },
    healthStatus: {
      type: new Schema(
        {
          health: {
            type: String,
            enum: ['bad', 'good', 'moderate', 'unknown'],
            required: true,
          },
        },
        {
          timestamps: true,
        },
      ),
      required: false,
    },
    packageStatus: {
      type: String,
      enum: ['Pending', 'Running', 'Expired'],
      default: 'Pending',
      required: true,
    },
    operatingStatus: {
      type: String,
      enum: ['running', 'idle', 'off'],
      // default: 'off',
      required: false,
    },
    energyScore: {
      type: Number,
      required: false,
    },
    thermalScore: {
      type: Number,
      required: false,
    },

    co2Emissions: {
      type: Number,
      required: false,
    },
    waterConsumption: {
      type: Number,
      required: false,
    },
    heatExchangeCapacity: {
      type: Number,
      required: false,
    },

    cycleCount: {
      type: new Schema<TCycleCount>(
        {
          life: {
            type: Number,
            required: false,
          },
          reservationPeriod: {
            type: Number,
            required: false,
          },
        },
        {
          _id: false,
          timestamps: false,
        },
      ),
      required: false,
      default: {
        life: 0,
        reservationPeriod: 0,
      },
    },
    category: {
      type: String,
      enum: ['washing-machine', 'general-machine'],
      required: true,
    },
    name: { type: String, required: true },
    issues: {
      type: [
        new Schema(
          {
            issue: { type: String, required: true },
          },
          {
            timestamps: true,
          },
        ),
      ],
      required: false,
    },
    // address: { type: AddressSchema, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    usedFor: { type: CompanySchema, required: true },
    generalMachine: {
      homeName: { type: String },
      homeType: { type: String },
      type: { type: String },
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
      required: false,
    },
    specialContactServiceProviderCompany: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceProviderCompany',
      required: false,
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

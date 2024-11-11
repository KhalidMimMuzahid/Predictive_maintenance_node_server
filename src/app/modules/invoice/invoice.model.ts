/* eslint-disable @typescript-eslint/no-this-alias */
import mongoose, { Schema } from 'mongoose';
import {
  TAdditionalProduct,
  TDocument,
  TInspection,
  TInvoice,
} from './invoice.interface';
import { PostBiddingProcessSchema } from '../reservationGroup/reservationGroup.model';
import { IsDeletedSchema } from '../common/common.model';

const AdditionalProductsSchema = new Schema({
  products: [
    new Schema<TAdditionalProduct>({
      // if  addedByUserType is showaAdmin; then we don't have this field
      addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceProviderEngineer',
        required: false,
      },
      addedByUserType: {
        type: String,
        enum: ['showaAdmin', 'serviceProviderEngineer'],
        required: true,
      },

      productName: { type: String, required: true },
      // quantity: { type: Number, required: true },

      cost: {
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        tax: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
      },
    }),
  ],

  documents: {
    type: [
      new Schema<TDocument>({
        url: String,
        fileName: String,
        fileType: String,
      }),
    ],
  },

  totalAmount: { type: Number, required: true, default: 0 },
  isPaid: { type: Boolean, required: true, default: false },
});

// Operator Information Schema
const OperatorInformationSchema = new Schema({
  heightOfOperator: {
    type: Number,
    required: true,
    min: 0, // Assuming height cannot be negative
  },
  weightOfOperator: {
    type: Number,
    required: true,
    min: 0, // Assuming weight cannot be negative
  },
  ageOfOperator: {
    type: Number,
    required: true,
    min: 0, // Assuming age cannot be negative
  },
  genderOfOperator: {
    type: String,
    required: true,
    enum: ['male', 'female'],
  },
  numberOfOperators: {
    type: Number,
    required: true,
    min: 1, // Assuming there must be at least one operator
  },
  operatingDistance: {
    type: Number,
    required: true,
    min: 0, // Assuming distance cannot be negative
  },
  workingDurations: {
    type: Number,
    required: true,
    min: 0, // Assuming working durations cannot be negative
  },
});

// Machine Environment Schema
const MachineEnvironmentSchema = new Schema({
  temperature: {
    type: Number,
    required: true,
  },
  humidity: {
    type: Number,
    required: true,
    min: 0,
    max: 100, // Humidity should be between 0% and 100%
  },
  drainageLiquidTemperature: {
    type: Number,
    required: true,
  },
  steamDrain: {
    type: Number,
    required: true,
  },
  noiseLevel: {
    type: Number,
    required: true,
    min: 0, // Assuming noise level cannot be negative
  },
  runningTimePerDay: {
    type: Number,
    required: true,
    min: 0, // Assuming running time cannot be negative
  },
  weightOfTheMachine: {
    type: Number,
    required: true,
    min: 0, // Assuming weight cannot be negative
  },
});

const InspectionSchema = new Schema<TInspection>({
  isInspecting: {
    type: Boolean,
  },
  serviceProviderEngineer: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceProviderEngineer',
    required: true,
  },
  inspectingTime: {
    type: Number,
    required: true,
    validate: {
      validator: function (v: number[]) {
        return v.every((time) => time >= 0); // Ensure all times are non-negative
      },
      message: () => `Inspecting time must be a non-negative number!`,
    },
  },

  serviceFee: {
    type: Number,
    required: false,
  },
  operatorInformation: {
    type: OperatorInformationSchema,
    required: false,
  },
  machineEnvironment: {
    type: MachineEnvironmentSchema,
    required: false,
  },
  issues: {
    type: String,
    required: false,
  },
  observation: {
    type: String,
    required: false,
  },
});
export const InvoiceSchema: Schema = new Schema<TInvoice>(
  {
    invoiceNo: { type: String, required: true },
    reservationRequest: {
      type: Schema.Types.ObjectId,
      ref: 'ReservationRequest',
      required: true,
    },
    reservationRequestGroup: {
      type: Schema.Types.ObjectId,
      ref: 'ReservationRequestGroup',
      required: true,
    },
    invoiceGroup: {
      type: Schema.Types.ObjectId,
      ref: 'InvoiceGroup',
      required: true,
    },

    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postBiddingProcess: {
      type: PostBiddingProcessSchema,
      required: false,
    },
    additionalProducts: {
      type: AdditionalProductsSchema,
      default: {
        products: [],
        totalAmount: 0,
        isPaid: false,
      },
      required: true,
    },
    inspection: {
      type: InspectionSchema,
      required: false,
    },
    taskStatus: {
      type: String,
      enum: ['ongoing', 'completed', 'canceled'],
      default: 'ongoing',
    },

    feedbackByUser: {
      type: new Schema({
        ratings: { type: Number, required: true },
        comment: { type: String, required: true },
      }),
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
InvoiceSchema.pre('find', function (next) {
  this.find({ 'isDeleted.value': { $ne: true } });
  next();
});
InvoiceSchema.pre('findOne', function (next) {
  this.find({ 'isDeleted.value': { $ne: true } });
  next();
});
export const Invoice = mongoose.model<TInvoice>('Invoice', InvoiceSchema);

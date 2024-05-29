import mongoose, { Schema, Types } from 'mongoose';
import {
  TPurchasedPrice,
  TSubscriptionPurchased,
  TUsage,
} from './subscriptionPurchased.interface';
import { SubscriptionSchema } from '../subscription/subscription.model';

const usageSchema = new Schema<TUsage>({
  showaUser: {
    machines: [{ type: Types.ObjectId, ref: 'Machine' }],
    IOTs: [{ type: Types.ObjectId, ref: 'SensorModuleAttached' }],
    totalAvailableMachine: Number,
    totalAvailableIOT: Number,
    totalAvailableShowaMB: Number,
  },
  // Uncomment and define serviceProviderAdmin if needed
  // serviceProviderAdmin: {
  //   engineers: [{ type: Types.ObjectId, ref: 'Engineer' }],
  // },
});

// Define the price schema for TSubscriptionPurchased
const purchasedPriceSchema = new Schema<TPurchasedPrice>({
  tax: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  applicablePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
});

const SubscriptionPurchasedSchema: Schema = new Schema<TSubscriptionPurchased>(
  {
    subscription: {
      type: new Schema(
        {
          ...SubscriptionSchema.obj,
          _id: { type: Types.ObjectId, required: true },
          createdAt: { type: Date, required: true, default: Date.now },
          updatedAt: { type: Date, required: true, default: Date.now },
        },
        { _id: false },
      ),
      required: true,
    },

    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    usage: {
      type: usageSchema,
      required: true,
    },
    expDate: {
      type: Date,
      required: true,
    },
    price: {
      type: purchasedPriceSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
export const SubscriptionPurchased = mongoose.model<TSubscriptionPurchased>(
  'SubscriptionPurchased',
  SubscriptionPurchasedSchema,
);

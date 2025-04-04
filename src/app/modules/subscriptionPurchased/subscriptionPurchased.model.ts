import mongoose, { Schema } from 'mongoose';
import {
  TPurchasedPrice,
  TServiceProviderCompanyForUses,
  TShowaUserForUses,
  TSubscriptionPurchased,
  TUsage,
} from './subscriptionPurchased.interface';
import { SubscriptionSchema } from '../subscription/subscription.model';

const usageSchema = new Schema<TUsage>({
  showaUser: new Schema<TShowaUserForUses>(
    {
      machines: [{ type: Schema.Types.ObjectId, ref: 'Machine' }],
      IOTs: [{ type: Schema.Types.ObjectId, ref: 'SensorModuleAttached' }],
      totalAvailableMachine: Number,
      totalAvailableIOT: Number,
      totalAvailableShowaMB: Number,
    },

    {
      timestamps: false,
      _id: false,
    },
  ),
  serviceProviderCompany: new Schema<TServiceProviderCompanyForUses>(
    {
      totalAvailableBranch: {
        type: Number,
        required: true,
      },
      totalAvailableVendor: {
        type: Number,
        required: true,
      },

      totalAvailableReservationAllowed: {
        type: Schema.Types.Mixed,
        required: true,
      },
      totalAvailableReservationAcceptable: {
        type: Schema.Types.Mixed,
        required: true,
      },
      serviceProviderBranches: [
        { type: Schema.Types.ObjectId, ref: 'ServiceProviderBranches' },
      ],

      serviceProviderBranchesAsVendor: [
        { type: Schema.Types.ObjectId, ref: 'ServiceProviderBranches' },
      ],
    },

    {
      timestamps: false,
      _id: false,
    },
  ),
  // Uncomment and define serviceProviderAdmin if needed
  // serviceProviderAdmin: {
  //   engineers: [{ type: Types.ObjectId, ref: 'Engineer' }],
  // },
});

// Define the price schema for TSubscriptionPurchased
export const purchasedPriceSchema = new Schema<TPurchasedPrice>({
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
          _id: { type: Schema.Types.ObjectId, required: true },
          createdAt: { type: Date, required: true, default: Date.now },
          updatedAt: { type: Date, required: true, default: Date.now },
        },
        { _id: false },
      ),
      required: true,
    },
    specialContactServiceProviderCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProviderCompany',
      required: false,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    serviceProviderCompany: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceProviderCompany',
      // required: true,
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

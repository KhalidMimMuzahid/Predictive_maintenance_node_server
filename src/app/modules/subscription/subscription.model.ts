import mongoose, { Schema } from 'mongoose';
import { IsDeletedSchema } from '../common/common.model';
import { moduleTypeEnum } from '../sensorModule/sensorModule.constant';
import {
  TBasic,
  TPackage,
  TPremium,
  TPrice,
  TServiceProviderCompany,
  TShowaUser,
  TStandard,
  TSubscription,
} from './subscription.interface';

const priceSchema = new Schema<TPrice>({
  netAmount: {
    type: Number,
    required: true,
  },
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'flat-rate'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          if (this.discount.type === 'percentage') {
            return value >= 0 && value <= 100;
          } else if (this.discount.type === 'flat-rate') {
            return value > 0;
          }
          return false;
        },
        message: (props) => `${props.value} is not a valid discount amount!`,
      },
    },
  },
});

const premiumSchema = new Schema<TPremium>({
  totalMachine: {
    type: Number,
    required: true,
  },
  totalIOT: {
    type: Number,
    required: true,
  },
  applicableModules: {
    type: [String],
    enum: moduleTypeEnum,
    required: true,
  },
});

const standardSchema = new Schema<TStandard>({
  totalMachine: {
    type: Number,
    required: true,
  },
});

const basicSchema = new Schema<TBasic>({
  showaMB: {
    type: Number,
    required: true,
  },
  totalIOT: {
    type: Number,
    required: true,
  },
  applicableModules: {
    type: [String],
    enum: moduleTypeEnum,
    required: true,
  },
});
const showaUserSchema = new Schema<TShowaUser>({
  packageType: {
    type: String,
    enum: ['premium', 'standard', 'basic'],
    required: true,
  },
  premium: {
    type: premiumSchema,
    required: function () {
      return this.packageType === 'premium';
    },
  },
  standard: {
    type: standardSchema,
    required: function () {
      return this.packageType === 'standard';
    },
  },
  basic: {
    type: basicSchema,
    required: function () {
      return this.packageType === 'basic';
    },
  },
});

const serviceProviderCompanySchema = new Schema<TServiceProviderCompany>({
  packageType: {
    type: String,
    enum: ['standard', 'enterprise'],
    required: true,
  },
  totalBranch: {
    type: Number,
    required: true,
  },
  totalReservationAllowed: {
    type: Schema.Types.Mixed,
    required: true,
  },
  totalReservationAcceptable: {
    type: Schema.Types.Mixed,
    required: true,
  },
  totalVendor: {
    type: Number,
    required: true,
  },
  teamSize: {
    type: Number,
    required: true,
  },
  hasMarketplaceAccess: {
    type: Boolean,
    required: true,
  },
});
const packageSchema = new Schema<TPackage>({
  packageFor: {
    type: String,
    enum: ['showaUser', 'serviceProviderCompany'],
    required: true,
  },
  showaUser: showaUserSchema,
  // Uncomment and define serviceProviderCompany schema if needed
  serviceProviderCompany: serviceProviderCompanySchema,
});

export const SubscriptionSchema: Schema = new Schema<TSubscription>(
  {
    subscriptionTitle: {
      type: String,
      required: true,
    },
    bannerUrl: {
      type: String,
      required: true,
    },
    package: packageSchema,
    price: priceSchema,
    validity: {
      type: Number,
      required: true,
    },
    features: {
      type: [String],
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
SubscriptionSchema.pre('find', function (next) {
  this.find({ 'isDeleted.value': { $ne: true } });
  next();
});

export const Subscription = mongoose.model<TSubscription>(
  'Subscription',
  SubscriptionSchema,
);

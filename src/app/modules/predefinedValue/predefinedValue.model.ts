import mongoose, { Schema } from 'mongoose';
import {
  TCategory,
  TCustomer,
  TMarketplace,
  TPredefinedValue,
  TProduct,
  TReservationRequest,
  TMachine,
  TSensorModuleAttached,
  TShop,
  TBrands,
  TIssue,
  TTypes,
} from './predefinedValue.interface';
const CategorySchema = new Schema<TCategory>({
  category: String,
  subCategories: [String],
});
const productSchema = new Schema<TProduct>({
  categories: {
    type: [CategorySchema],
  },
});

const shopSchema = new Schema<TShop>({
  categories: [String], // shop types
});

const marketplaceSchema = new Schema<TMarketplace>({
  type: {
    type: String,
    enum: ['product', 'shop'],
    required: true,
  },
  product: productSchema,
  shop: shopSchema,
});
const sensorModuleAttachedSchema = new Schema<TSensorModuleAttached>({
  sectionNames: [String],
});
const customerSchema = new Schema<TCustomer>({
  occupation: [String],
});

const ReservationRequestSchema = new Schema<TReservationRequest>({
  statuses: [String],
  nearestLocations: {
    type: new Schema({
      selectedRadius: {
        type: Number,
        required: false,
      },
      radiuses: [Number],
    }),
  },
  areas: [String],
  issues: [String],
});
const machineSchema = new Schema<TMachine>({
  types: [
    new Schema<TTypes>({
      category: {
        type: String,
        enum: ['washing-machine', 'general-machine'],
        required: true,
      },
      types: [String],
    }),
  ],
  brands: [
    new Schema<TBrands>({
      brand: String,
      models: [String],
    }),
  ],
  issues: [
    new Schema<TIssue>({
      category: {
        type: String,
        enum: ['washing-machine', 'general-machine'],
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      brand: {
        type: String,
        required: true,
      },
      model: {
        type: String,
        required: true,
      },
      issues: {
        type: [String],
        required: true,
      },
    }),
  ],
});
const predefinedValueSchema = new Schema<TPredefinedValue>(
  {
    type: {
      type: String,
      enum: [
        'marketplace',
        'sensorModuleAttached',
        'customer',
        'reservationRequest',
        'machine',
      ],
      required: true,
    },
    marketplace: marketplaceSchema,
    sensorModuleAttached: sensorModuleAttachedSchema,
    reservationRequest: ReservationRequestSchema,
    customer: customerSchema,
    machine: machineSchema,
  },
  {
    timestamps: true,
  },
);

const PredefinedValue = mongoose.model<TPredefinedValue>(
  'PredefinedValue',
  predefinedValueSchema,
);

export default PredefinedValue;

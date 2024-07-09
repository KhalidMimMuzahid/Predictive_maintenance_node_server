import mongoose, { Schema } from 'mongoose';
import {
  TCategory,
  TMarketplace,
  TPredefinedValue,
  TProduct,
  TSensorModuleAttached,
  TShop,
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

const predefinedValueSchema = new Schema<TPredefinedValue>(
  {
    type: {
      type: String,
      enum: ['marketplace', 'sensorModuleAttached'],
      required: true,
    },
    marketplace: marketplaceSchema,
    sensorModuleAttached: sensorModuleAttachedSchema,
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

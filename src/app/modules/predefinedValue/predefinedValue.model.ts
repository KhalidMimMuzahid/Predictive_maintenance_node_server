import mongoose, { Schema } from 'mongoose';
import {
  TCategory,
  TMarketplace,
  TPredefinedValue,
  TProduct,
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

const predefinedValueSchema = new Schema<TPredefinedValue>(
  {
    type: {
      type: String,
      enum: ['marketplace'],
      required: true,
    },
    marketplace: marketplaceSchema,
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

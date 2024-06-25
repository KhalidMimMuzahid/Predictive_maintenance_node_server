import { Schema, model, Types } from 'mongoose';
import { TProduct } from './product.interface';

// Define the schema for the TProduct type
const productSchema = new Schema<TProduct>({
  productId: { type: String, required: true },
  addedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  details: { type: String, required: true },
  model: { type: String, required: true },

  brand: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },

  regularPrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },

  taxStatus: {
    type: String,
    enum: ['applicable', 'not-applicable'],
    required: true,
  },
  taxStatusClass: { type: String, required: true },

  size: { type: [String], required: true },
  weight: { type: Number, required: true },
  length: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },

  stockManagement: {
    availableStock: { type: Number, required: true },
    stockKeepingUnit: { type: Number, required: true },
    stockStatus: {
      type: String,
      enum: ['available', 'not-available'],
      required: true,
    },
    individualSold: { type: Boolean, required: true },
    trackStockQuantity: { type: Boolean, required: true },
  },

  photos: [
    {
      photoUrl: { type: String, required: true },
      color: { type: String, required: true },
      title: { type: String, required: true },
    },
  ],

  feedback: {
    rate: { type: Number, min: 0, max: 5, required: true },
    reviews: [
      {
        review: { type: String, required: true },
        rate: { type: Number, min: 0, max: 5, required: true },
        user: { type: Types.ObjectId, required: true, ref: 'User' },
      },
    ],
  },
});

// Create the model from the schema
const Product = model('Product', productSchema);

export default Product;

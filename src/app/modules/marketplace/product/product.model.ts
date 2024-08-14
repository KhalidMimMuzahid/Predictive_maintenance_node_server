import { Schema, model } from 'mongoose';
import { TProduct } from './product.interface';

// Define the schema for the TProduct type
const productSchema = new Schema<TProduct>(
  {
    productId: { type: String, required: true },
    ownedBy: {
      type: String,
      enum: ['serviceProviderCompany', 'showa'],
      required: true,
    },
    addedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
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
    taxRate: { type: Number, required: true },

    size: { type: [String] },

    packageSize: {
      weight: { type: Number },
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },

    stockManagement: {
      availableStock: { type: Number, required: true },
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
      rate: { type: Number, min: 0, max: 5 },
      reviews: [
        {
          review: { type: String, required: true },
          rate: { type: Number, min: 0, max: 5, required: true },
          user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

// Create the model from the schema
const Product = model('Product', productSchema);

export default Product;

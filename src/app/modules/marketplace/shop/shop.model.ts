import { Schema, model } from 'mongoose';
import { TShop } from './shop.interface';
import { AddressSchema } from '../../common/common.model';

// Define the schema for the TProduct type
const shopSchema = new Schema<TShop>(
  {
    serviceProviderAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    ownedBy: {
      type: String,
      enum: ['serviceProviderCompany', 'showa'],
      required: true,
    },

    type: {
      type: String,
      required: true,
    },
    serviceProviderCompany: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'ServiceProviderCompany',
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'suspended'],
      required: true,
    },
    shopName: {
      type: String,
      required: true,
    },
    shopRegNo: {
      type: String,
      required: false,
    },
    address: { type: AddressSchema, required: false },
    phone: {
      type: String,
      required: false,
    },

    photoUrl: String,

    registrationDocument: [
      {
        photoUrl: String,
        title: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Create the model from the schema
const Shop = model('Shop', shopSchema);

export default Shop;

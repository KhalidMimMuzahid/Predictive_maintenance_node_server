import { Schema, model } from 'mongoose';
import { paymentTypesArray } from './order.const';
import { TOrder } from './order.interface';

// Define the schema for the TProduct type
const orderSchema = new Schema<TOrder>(
  {
    orderId: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'shipped', 'delivered', 'canceled'],
      required: true,
    },
    pending: {
      type: new Schema(
        {
          isActivated: {
            type: Boolean,
            required: true,
          },
          customDate: {
            type: Date,
            required: false,
          },
        },
        {
          timestamps: true,
        },
      ),
      required: false,
    },
    inprogress: {
      type: new Schema(
        {
          isActivated: {
            type: Boolean,
            required: true,
          },
          customDate: {
            type: Date,
            required: false,
          },
        },
        {
          timestamps: true,
        },
      ),
      required: false,
    },
    shipped: {
      type: new Schema(
        {
          isActivated: {
            type: Boolean,
            required: true,
          },
          customDate: {
            type: Date,
            required: false,
          },
        },
        {
          timestamps: true,
        },
      ),
      required: false,
    },

    delivered: {
      type: new Schema(
        {
          isActivated: {
            type: Boolean,
            required: true,
          },
          customDate: {
            type: Date,
            required: false,
          },
        },
        {
          timestamps: true,
        },
      ),
      required: false,
    },
    canceled: {
      type: new Schema(
        {
          isActivated: {
            type: Boolean,
            required: true,
          },
          customDate: {
            type: Date,
            required: false,
          },
        },
        {
          timestamps: true,
        },
      ),
      required: false,
    },

    paymentType: {
      type: String,
      enum: paymentTypesArray,
      required: true,
    },
    cost: {
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      transferFee: { type: Number, default: 0, required: true },
      totalAmount: { type: Number, required: true },
    },
    paidStatus: {
      isPaid: { type: Boolean, required: true },
      paidAt: { type: Date },
      transaction: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    },
  },
  {
    timestamps: true,
  },
);

// Create the model from the schema
const Order = model('Order', orderSchema);

export default Order;

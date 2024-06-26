import { Schema, model } from 'mongoose';
import { TCart } from './cart.interface';

// Define the schema for the TProduct type
const cartSchema = new Schema<TCart>(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    product: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },

    quantity: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

// Create the model from the schema
const Cart = model('Cart', cartSchema);

export default Cart;

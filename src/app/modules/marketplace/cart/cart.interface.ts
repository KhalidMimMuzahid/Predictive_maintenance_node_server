import mongoose from 'mongoose';

export type TCart = {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId; //
  // applicablePrice: number;
  // vatOrTax: number;
  quantity: number;
};

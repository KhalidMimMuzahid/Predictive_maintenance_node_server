import mongoose from 'mongoose';

export type TCart = {
  product: mongoose.Types.ObjectId;
  applicablePrice: number;
  quantity: number;
  vatOrTax: number;
};

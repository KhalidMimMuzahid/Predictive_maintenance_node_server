import { Types } from 'mongoose';

export type TOrder = {
  //
  orderId: string;
  product: Types.ObjectId;
  isPaid: boolean;
  status: 'pending' | 'in-progress' | 'delivered';
  cost: {
    price: number;
    quantity: number;
    // tax?: number; // percentage of tax ; by default 0%
    totalAmount: number;
  };
};

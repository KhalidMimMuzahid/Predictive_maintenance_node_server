import { Types } from 'mongoose';

export type TOrder = {
  //
  orderId: string;
  user: Types.ObjectId; //
  product: Types.ObjectId;

  status: 'pending' | 'in-progress' | 'delivered';
  cost: {
    price: number;
    quantity: number;
    // tax?: number; // percentage of tax ; by default 0%
    transferFee: number;
    totalAmount: number;
  };
  paidStatus: {
    isPaid: boolean;
    paidAt: Date;
    transaction: Types.ObjectId;
  };
};


// transferId: 
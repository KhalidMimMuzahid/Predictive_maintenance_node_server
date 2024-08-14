import { Types } from 'mongoose';

export type TPaymentType = 'cash-on-delivery' | 'showa-balance';

export type TOrder = {
  //
  orderId: string;
  user: Types.ObjectId; //
  product: Types.ObjectId;
  // shop: Types.ObjectId;
  status: 'pending' | 'in-progress' | 'delivered';

  paymentType: TPaymentType;
  cost: {
    price: number;
    quantity: number;
    // tax?: number; // percentage of tax ; by default 0%
    transferFee: number;
    totalAmount: number;
  };
  paidStatus: {
    isPaid: boolean;
    paidAt?: Date;
    transaction?: Types.ObjectId;
  };
};

export type TOrders = {
  product: string;
  quantity: number;
}[];
// transferId:

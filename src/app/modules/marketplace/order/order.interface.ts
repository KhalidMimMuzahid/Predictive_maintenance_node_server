import { Types } from 'mongoose';

export type TPaymentType = 'cash-on-delivery' | 'showa-balance';
export type TActionType = 'cancel' | 'accept';
export type TOrder = {
  //
  orderId: string;
  user: Types.ObjectId; //
  product: Types.ObjectId;
  shop: Types.ObjectId; // work on that
  status: 'pending' | 'inprogress' | 'shipped' | 'delivered' | 'canceled'; // shipped  and canceled
  pending?: {
    isActivated: boolean;
  };
  inprogress?: {
    isActivated: boolean;
  };
  shipped?: {
    isActivated: boolean;
  };
  delivered?: {
    isActivated: boolean;
  };
  canceled?: {
    isActivated: boolean;
  };
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

import { Types } from 'mongoose';

export type TPaymentType = 'cash-on-delivery' | 'showa-balance';
export type TActionType = 'cancel' | 'accept';
export type TActionTypeForChangesStatus = 'inprogress' | 'shipped';
export type OrderCost = {
  price: number;
  quantity: number;
  // tax?: number; // percentage of tax ; by default 0%
  transferFee: number;
  totalAmount: number;
};
export type TOrder = {
  //
  orderId: string;
  user: Types.ObjectId; //
  product: Types.ObjectId;
  shop: Types.ObjectId; // work on that
  status: 'pending' | 'inprogress' | 'shipped' | 'delivered' | 'canceled'; // shipped  and canceled
  pending?: {
    isActivated: boolean;
    customDate?: Date; // if custom is present then its a real date otherwise updatedAt date will be the real date
  };
  inprogress?: {
    isActivated: boolean;
    customDate?: Date;
  };
  shipped?: {
    isActivated: boolean;
    customDate?: Date;
  };
  delivered?: {
    isActivated: boolean;
    customDate?: Date;
  };
  canceled?: {
    isActivated: boolean;
    customDate?: Date;
  };
  paymentType: TPaymentType;
  cost: OrderCost;
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

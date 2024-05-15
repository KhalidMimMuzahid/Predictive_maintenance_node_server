import { Types } from 'mongoose';
import { TIsDeleted } from '../common/common.interface';

// I have some confusion about this transaction model
export type TTransaction = {
  category:
    | 'joining-bonus'
    | 'reference-bonus'
    | 'package-purchase'
    | 'send-money'
    | 'fund-transfer'
    | 'payment'
    | 'mb-transfer'; // value can be like
  transactionId: string; //
  from: Types.ObjectId; // objectId of the UserModel
  recipient: Types.ObjectId; // objectId of the UserModel

  transactionDate: Date; // when this transaction will be happening
  paymentMethod: 'showa-balance' | 'showa-point' | 'card' | 'showa-mb'; // what about showa mb ?
  referenceId: string; // objectId of the UserModel
  netAmount: number; //
  transactionFee: number; //
  totalAmount: number; // total amount
  status: 'pending' | 'success' | 'failure'; //  success or approved?? which sounds good?

  isDeleted: TIsDeleted; // by default false
};

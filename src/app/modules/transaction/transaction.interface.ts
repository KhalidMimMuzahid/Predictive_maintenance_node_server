import { Types } from 'mongoose';
import { TIsDeleted } from '../common/common.interface';
export type TWalletStatus = {
  previous: {
    balance: number; //
    point: number; //
    showaMB: number; // ?????????
  };
  next: {
    balance: number; //
    point: number; //
    showaMB: number; // ?????????
  };
};
export type TBonus = {
  type: 'joiningBonus' | 'referenceBonus';
  joiningBonus?: {
    //
  };
  referenceBonus?: {
    //
  };
};
export type TWalletInterchange = {
  type: 'pointToBalance' | 'balanceToShowaMB';
  user: Types.ObjectId; // objectId of the UserModel
  walletStatus: TWalletStatus;
  pointToBalance?: {
    point: number;
    balance: number;
    transactionFee: number; //
  };
  balanceToShowaMB?: {
    balance: number;
    showaMB: number;
    transactionFee: number; //
  };
};
export type TPayment = {
  type: 'productPurchase' | 'subscriptionPurchase';
  productPurchase?: {
    //
  };
  subscriptionPurchase?: {
    //
  };
};
export type TFundTransfer = {
  requestType: 'send' | 'receive';
  fundType: 'balance' | 'point' | 'showaMB';
  sender: {
    user: Types.ObjectId; // objectId of the UserModel
    walletStatus: TWalletStatus;
  };
  receiver: {
    user: Types.ObjectId; // objectId of the UserModel
    walletStatus: TWalletStatus;
  };
  amount: number;
  transactionFee: number; //
};

export type TAddFund = {
  source: 'bankAccount' | 'card';
  user: Types.ObjectId; // objectId of the UserModel ; who added the fund
  amount: number;
  card?: {
    //
    stripeSessionId: string;
    walletStatus?: TWalletStatus;
  };
  bankAccount?: {
    //s
  };
  transactionFee: number; //
};
export type TTransactionStatus = 'pending' | 'completed' | 'failed'; //  success or approved?? which sounds good?
export type TTransaction = {
  type: 'walletInterchange' | 'fundTransfer' | 'payment' | 'addFund';
  bonus?: TBonus;
  walletInterchange?: TWalletInterchange;
  payment?: TPayment;
  fundTransfer?: TFundTransfer;
  addFund?: TAddFund;

  status: TTransactionStatus;

  isDeleted: TIsDeleted; // by default false
};

// referenceId: Types.ObjectId; // objectId of the UserModel
// transactionId: string; //
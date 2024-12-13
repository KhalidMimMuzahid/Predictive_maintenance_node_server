import { Types } from 'mongoose';
import { TIsDeleted } from '../common/common.interface';
import { TPurchasedPrice } from '../subscriptionPurchased/subscriptionPurchased.interface';

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
    user: Types.ObjectId;
    // products: Types.ObjectId;
    costs: {
      product: Types.ObjectId;
      price: number;
      quantity: number;
      // tax?: number; // percentage of tax ; by default 0%
      transferFee: number;
      totalAmount: number;
    }[];
    amount: number;
  };
  subscriptionPurchase?: {
    user: Types.ObjectId;
    subscriptionPurchased: Types.ObjectId;
    price: TPurchasedPrice;
  };
  walletStatus: TWalletStatus;
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
  type: 'bonus' | 'walletInterchange' | 'fundTransfer' | 'payment' | 'addFund';
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
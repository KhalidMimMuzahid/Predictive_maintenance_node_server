import mongoose, { Schema } from 'mongoose';
import { IsDeletedSchema } from '../common/common.model';
import {
  TAddFund,
  TBonus,
  TFundTransfer,
  TPayment,
  TTransaction,
  TWalletInterchange,
  TWalletStatus,
} from './transaction.interface';
import { purchasedPriceSchema } from '../subscriptionPurchased/subscriptionPurchased.model';

const BonusSchema: Schema<TBonus> = new Schema<TBonus>(
  {
    type: {
      type: String,
      enum: ['joiningBonus', 'referenceBonus'],
    },
    joiningBonus: Schema.Types.Mixed, // Replace with detailed schema if required
    referenceBonus: Schema.Types.Mixed, // Replace with detailed schema if required
  },
  {
    timestamps: false,
    _id: false,
  },
);
const WalletStatusSchema: Schema<TWalletStatus> = new Schema<TWalletStatus>(
  {
    previous: {
      balance: { type: Number },
      point: { type: Number },
      showaMB: { type: Number },
    },
    next: {
      balance: { type: Number },
      point: { type: Number },
      showaMB: { type: Number },
    },
  },
  {
    timestamps: false,
    _id: false,
  },
);
const WalletInterchangeSchema: Schema<TWalletInterchange> =
  new Schema<TWalletInterchange>(
    {
      type: {
        type: String,
        enum: ['pointToBalance', 'balanceToShowaMB'],
      },
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      walletStatus: WalletStatusSchema,
      pointToBalance: {
        point: { type: Number },
        balance: { type: Number },
        transactionFee: { type: Number },
      },
      balanceToShowaMB: {
        balance: { type: Number },
        showaMB: { type: Number },
        transactionFee: { type: Number },
      },
    },
    {
      timestamps: false,
      _id: false,
    },
  );

const PaymentSchema: Schema<TPayment> = new Schema<TPayment>(
  {
    type: {
      type: String,
      enum: ['productPurchase', 'subscriptionPurchase'],
    },
    productPurchase: {
      type: new Schema({
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

        costs: [
          new Schema({
            product: {
              type: Schema.Types.ObjectId,
              ref: 'Product',
              required: true,
            },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            transferFee: { type: Number, default: 0, required: true },
            totalAmount: { type: Number, required: true },
          }),
        ],
        amount: { type: Number, required: true },
      }),
    },
    subscriptionPurchase: {
      type: new Schema({
        user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
        serviceProviderCompany: {
          type: Schema.Types.ObjectId,
          ref: 'ServiceProviderCompany',
          required: false,
        },
        subscriptionPurchased: {
          type: Schema.Types.ObjectId,
          ref: 'SubscriptionPurchased',
          required: true,
        },
        price: {
          type: purchasedPriceSchema,
          required: true,
        },
      }),
    },
    walletStatus: WalletStatusSchema,
  },
  {
    timestamps: false,
    _id: false,
  },
);
const FundTransferSchema: Schema<TFundTransfer> = new Schema<TFundTransfer>(
  {
    requestType: {
      type: String,
      enum: ['send', 'receive'],
    },
    fundType: {
      type: String,
      enum: ['balance', 'point', 'showaMB'],
    },
    sender: {
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      walletStatus: WalletStatusSchema,
    },
    receiver: {
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      walletStatus: WalletStatusSchema,
    },
    amount: { type: Number },
    transactionFee: { type: Number },
  },

  {
    timestamps: false,
    _id: false,
  },
);
const AddFundSchema: Schema<TAddFund> = new Schema<TAddFund>(
  {
    source: {
      type: String,
      enum: ['bankAccount', 'card'],
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number },
    card: {
      stripeSessionId: { type: String },
      walletStatus: {
        previous: {
          balance: { type: Number },
          point: { type: Number },
          showaMB: { type: Number },
        },
        next: {
          balance: { type: Number },
          point: { type: Number },
          showaMB: { type: Number },
        },
      },
    },
    bankAccount: Schema.Types.Mixed, // Replace with detailed schema if required
    transactionFee: { type: Number },
  },
  {
    timestamps: false,
    _id: false,
  },
);
const TransactionSchema: Schema<TTransaction> = new Schema<TTransaction>(
  {
    type: {
      type: String,
      enum: [
        'bonus',
        'walletInterchange',
        'fundTransfer',
        'payment',
        'addFund',
      ],
      required: true,
    },
    bonus: BonusSchema,
    walletInterchange: WalletInterchangeSchema,
    payment: PaymentSchema,
    fundTransfer: FundTransferSchema,
    addFund: AddFundSchema,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    isDeleted: IsDeletedSchema,
  },
  {
    timestamps: true,
  },
);

TransactionSchema.pre('find', function (next) {
  this.find({ 'isDeleted.value': { $ne: true } });
  next();
});

TransactionSchema.pre('findOne', function (next) {
  this.findOne({ 'isDeleted.value': { $ne: true } });
  next();
});

export const Transaction = mongoose.model<TTransaction>(
  'Transaction',
  TransactionSchema,
);

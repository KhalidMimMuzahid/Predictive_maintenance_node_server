import mongoose, { Schema } from 'mongoose';
import {
  TCategory,
  TCustomer,
  TMarketplace,
  TPredefinedValue,
  TProduct,
  TReservationRequest,
  TMachine,
  TSensorModuleAttached,
  TShop,
  TBrands,
  TIssue,
  TTypes,
  TSectionName,
  TWallet,
  TBonus,
  TWalletInterchange,
  TPayment,
  TFundTransfer,
  TAddFund,
} from './predefinedValue.interface';
const CategorySchema = new Schema<TCategory>({
  category: String,
  subCategories: [String],
});
const productSchema = new Schema<TProduct>({
  categories: {
    type: [CategorySchema],
  },
});

const shopSchema = new Schema<TShop>({
  categories: [String], // shop types
});

const marketplaceSchema = new Schema<TMarketplace>({
  type: {
    type: String,
    enum: ['product', 'shop'],
    required: true,
  },
  product: productSchema,
  shop: shopSchema,
});
const sensorModuleAttachedSchema = new Schema<TSensorModuleAttached>({
  sectionNames: [String],
  sectionNames2: [
    new Schema<TSectionName>({
      category: {
        type: String,
        enum: ['washing-machine', 'general-machine'],
        required: true,
      },
      type: {
        type: String,
        required: true,
      },

      sectionNames: {
        type: [String],
        required: true,
      },
    }),
  ],
});
const customerSchema = new Schema<TCustomer>({
  occupation: [String],
});

const ReservationRequestSchema = new Schema<TReservationRequest>({
  statuses: [String],
  nearestLocations: {
    type: new Schema({
      selectedRadius: {
        type: Number,
        required: false,
      },
      radiuses: [Number],
    }),
  },
  areas: [String],
  issues: [String],
});
const machineSchema = new Schema<TMachine>({
  types: [
    new Schema<TTypes>({
      category: {
        type: String,
        enum: ['washing-machine', 'general-machine'],
        required: true,
      },
      types: [String],
    }),
  ],
  brands: [
    new Schema<TBrands>({
      brand: String,
      models: [String],
    }),
  ],
  issues: [
    new Schema<TIssue>({
      category: {
        type: String,
        enum: ['washing-machine', 'general-machine'],
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      brand: {
        type: String,
        required: true,
      },
      model: {
        type: String,
        required: true,
      },
      issues: {
        type: [String],
        required: true,
      },
    }),
  ],
});
const BonusSchema: Schema<TBonus> = new Schema<TBonus>(
  {
    joiningBonus: {
      amount: { type: Number },
    },
    referenceBonus: {
      amount: { type: Number },
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
      pointToBalance: {
        transactionFee: { type: Number },
      },
      balanceToShowaMB: {
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
    productPurchase: {
      transactionFee: { type: Number },
    },
    subscriptionPurchase: {
      transactionFee: { type: Number },
    },
  },
  {
    timestamps: false,
    _id: false,
  },
);
const FundTransferSchema: Schema<TFundTransfer> = new Schema<TFundTransfer>(
  {
    transactionFee: { type: Number },
  },
  {
    timestamps: false,
    _id: false,
  },
);
const AddFundSchema: Schema<TAddFund> = new Schema<TAddFund>(
  {
    card: {
      transactionFee: { type: Number },
    },
    bankAccount: {
      transactionFee: { type: Number },
    },
  },
  {
    timestamps: false,
    _id: false,
  },
);
const walletSchema = new Schema<TWallet>({
  bonus: BonusSchema,
  walletInterchange: WalletInterchangeSchema,
  payment: PaymentSchema,
  fundTransfer: FundTransferSchema,
  addFund: AddFundSchema,
});
const predefinedValueSchema = new Schema<TPredefinedValue>(
  {
    type: {
      type: String,
      enum: [
        'marketplace',
        'sensorModuleAttached',
        'customer',
        'reservationRequest',
        'machine',
        'wallet',
      ],
      required: true,
    },
    marketplace: marketplaceSchema,
    sensorModuleAttached: sensorModuleAttachedSchema,
    reservationRequest: ReservationRequestSchema,
    customer: customerSchema,
    machine: machineSchema,
    wallet: walletSchema,
  },
  {
    timestamps: true,
  },
);

const PredefinedValue = mongoose.model<TPredefinedValue>(
  'PredefinedValue',
  predefinedValueSchema,
);

export default PredefinedValue;

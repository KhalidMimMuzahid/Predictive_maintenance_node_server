import { TMachineCategory } from '../machine/machine.interface';

export type TCategory = {
  category: string;
  subCategories: string[];
};

export type TProduct = {
  categories: TCategory[];
};
export type TShop = {
  categories: string[]; // its actually shop type
};
export type TMarketplace = {
  type: 'product' | 'shop';
  product?: TProduct;
  shop?: TShop;
};
export type TSectionName = {
  category: TMachineCategory; // machine type
  type: string; // washing/general machine type
  sectionNames: string[];
};

export type TSensorModuleAttached = {
  sectionNames?: string[];
  sectionNames2?: TSectionName[];
};
export type TCustomer = {
  occupation?: string[];
};

export type TReservationRequest = {
  statuses?: string[];
  nearestLocations?: {
    selectedRadius?: number;
    radiuses: number[];
  };
  areas?: string[];
  issues?: string[];
};
export type TBrands = {
  brand: string;
  models?: string[];
};
export type TIssue = {
  category: TMachineCategory; // machine type
  type: string; // washing/general machine type
  brand: string;
  model: string;
  issues: string[];
};
export type TTypes = {
  category: TMachineCategory; // machine type
  types: string[]; // washing/general machine type
};
export type TMachine = {
  types?: TTypes[]; // type of washing/general machine
  brands?: TBrands[];
  issues?: TIssue[];
};

export type TBonus = {
  joiningBonus?: {
    amount: number; // flat discount
  };
  referenceBonus?: {
    amount: number; // flat or percentage discounts
  };
};

export type TWalletInterchange = {
  pointToBalance?: {
    transactionFee: number;
  };
  balanceToShowaMB?: {
    transactionFee: number;
  };
};
export type TPayment = {
  productPurchase?: {
    transactionFee: number;
  };
  subscriptionPurchase?: {
    transactionFee: number;
  };
};

export type TFundTransfer = {
  transactionFee: number; //
};

export type TAddFund = {
  card?: {
    transactionFee: number;
  };
  bankAccount?: {
    transactionFee: number;
  };
};
export type TTransactionFeeType =
  | 'all' // this is only for getting all predefined value for wallet
  | 'bonus-joiningBonus'
  | 'bonus-referenceBonus'
  | 'walletInterchange-pointToBalance'
  | 'walletInterchange-balanceToShowaMB'
  | 'fundTransfer'
  | 'payment-productPurchase'
  | 'payment-subscriptionPurchase'
  | 'addFund-card'
  | 'addFund-bankAccount';
  


export type TWallet = {
  bonus?: TBonus;
  walletInterchange?: TWalletInterchange;
  payment?: TPayment;
  fundTransfer?: TFundTransfer;
  addFund?: TAddFund;
};
export type TPredefinedValue = {
  type:
    | 'marketplace'
    | 'sensorModuleAttached'
    | 'customer'
    | 'reservationRequest'
    | 'machine'
    | 'wallet';

  marketplace?: TMarketplace;
  sensorModuleAttached?: TSensorModuleAttached;
  customer?: TCustomer;
  reservationRequest?: TReservationRequest;
  machine?: TMachine;
  wallet?: TWallet;
};

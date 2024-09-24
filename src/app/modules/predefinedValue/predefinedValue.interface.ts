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

export type TSensorModuleAttached = {
  sectionNames?: string[];
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
export type TMachine = {
  types?: string[]; // type of washing machine
  brands?: TBrands[];
};
export type TPredefinedValue = {
  type:
    | 'marketplace'
    | 'sensorModuleAttached'
    | 'customer'
    | 'reservationRequest'
    | 'machine';

  marketplace?: TMarketplace;
  sensorModuleAttached?: TSensorModuleAttached;
  customer?: TCustomer;
  reservationRequest?: TReservationRequest;
  machine?: TMachine;
};



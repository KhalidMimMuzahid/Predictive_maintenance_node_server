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
  sectionNames: string[];
};
export type TCustomer = {
  occupation: string[];
};
export type TReservationRequest = {
  statuses: string[];
  nearestLocations: string[];
  areas: string[];
  issues: string[];
};

export type TMachine = {
  types: string[]; // type of washing machine
  brands: string[];
  models: string[];
};
export type TPredefinedValue = {
  type:
    | 'marketplace'
    | 'sensorModuleAttached'
    | 'customer'
    | 'reservationRequest';
  marketplace?: TMarketplace;
  sensorModuleAttached?: TSensorModuleAttached;
  customer: TCustomer;
  reservationRequest: TReservationRequest;
  machine: TMachine;
};



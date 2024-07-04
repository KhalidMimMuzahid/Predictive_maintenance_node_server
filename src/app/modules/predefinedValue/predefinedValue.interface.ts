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

export type TPredefinedValue = {
  type: 'marketplace' | 'sensorModuleAttached';
  marketplace?: TMarketplace;
  // sensorModuleAttached: {
  //   sectionName: string;
  // };
};

// export type TCategories = 'accessories'
// brand  :{brandName, brandLogo}
export type TProduct = {
  productId: string;
  name: string; // title
  details: string; // description
  model: string;
  size: string;
  brand: string; // created by admin

  category: string; // created by admin
  subCategory: string; // created by admin

  regularPrice: number;
  salePrice: number;
  taxStatus: string; // "Applicable" or "Not Applicable"
  taxStatusClass: string; // supply-3402

  weight: number; // in kgs
  length: number; //
  width: number; //
  height: number; //

  stockManagement: {
    availableStock: number;
    stockStatus: string; // "Available" or "Not Available"
    individualSold: boolean; //
    trackStockQuantity: boolean; //
  };
  photos: {
    photoUrl: string;
    color: string;
    title: string;
  }[];

  // reviews and ratings
};

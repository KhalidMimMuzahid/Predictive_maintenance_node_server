// export type TCategories = 'accessories'
// brand  :{brandName, brandLogo}
import { Types } from 'mongoose';



export type TProductFilter = {
  productName: string;
  brandName: string;
  modelName: string;
  category: string;
  subCategory: string;
  minPrice: string;
  maxPrice: string;
};

export type TProduct = {
  productId: string;
  ownedBy: 'serviceProviderCompany' | 'showa';
  addedBy: Types.ObjectId;
  shop?: Types.ObjectId;

  name: string; // title
  details: string; // description
  brand: string; // last string is for others created by admin
  model: string;

  category: string; // created by admin
  subCategory: string; // created by admin

  regularPrice: number;
  salePrice: number;

  taxStatus: 'applicable' | 'not-applicable';
  taxRate: number; // taxStatusClass

  size: string[];

  packageSize: {
    weight: number; // in kgs
    length: number; //
    width: number; //
    height: number; //
  };

  stockManagement: {
    // stockKeepingUnit: number;
    availableStock: number; // stockKeepingUnit
    // stockStatus: 'available' | 'not-available'; // "Available" or "Not Available"
    // individualSold: boolean; //
    trackStockQuantity: boolean; // if it is on then , it the stocks reaches to 5 or less than that, then send notification to seller
  };
  photos: {
    photoUrl: string;
    color: string;
    title: string;
  }[];

  feedback: {
    rate: number; // 0 to 5
    reviews: {
      review: string;
      rate: number;
      user: Types.ObjectId; // objectId of the User
    }[];
  };
  // reviews and ratings
};

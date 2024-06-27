// export type TCategories = 'accessories'
// brand  :{brandName, brandLogo}
import { Types } from 'mongoose';
export type TProduct = {
  productId: string;
  ownedBy: 'serviceProviderCompany' | 'showa';
  addedBy: Types.ObjectId;
  shop?: Types.ObjectId;

  name: string; // title
  details: string; // description
  model: string;

  brand: string; // last string is for others created by admin
  category: string; // created by admin
  subCategory: string; // created by admin

  regularPrice: number;
  salePrice: number;

  taxStatus: 'applicable' | 'not-applicable';
  taxStatusClass: string; // supply-3402

  size: string[];
  weight: number; // in kgs
  length: number; //
  width: number; //
  height: number; //

  stockManagement: {
    stockKeepingUnit: number;
    availableStock: number;
    stockStatus: 'available' | 'not-available'; // "Available" or "Not Available"
    individualSold: boolean; //
    trackStockQuantity: boolean; //
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

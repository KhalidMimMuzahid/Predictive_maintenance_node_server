import { Types } from 'mongoose';
import { TPostBiddingProcess } from '../reservationGroup/reservationGroup.interface';
import { TIsDeleted } from '../common/common.interface';
export type TAdditionalProduct = {
  addedBy?: Types.ObjectId; // ServiceProviderEngineer model

  addedByUserType: 'showaAdmin' | 'serviceProviderEngineer';
  productName: string;
  // quantity: number;
  // promo:number // percentage of promo ; by default 0%   // is it the same of discount offer? what is actually a promo?

  cost: {
    price: number;
    quantity: number;
    tax?: number; // percentage of tax ; by default 0%
    totalAmount: number;
    // currency: string;
  };
};   
export type TInvoice = {
  invoiceNo: string; // customized unique number

  reservationRequest: Types.ObjectId; // objectId of ReservationRequest  model
  reservationRequestGroup: Types.ObjectId;
  invoiceGroup: Types.ObjectId; // objectId of InvoiceGroup model

  user: Types.ObjectId; // objectId of the user model; who raise this reservation

  // inspectionByEngineer: report
  postBiddingProcess?: TPostBiddingProcess;

  additionalProducts: {
    products: TAdditionalProduct[];
    totalAmount: number;
    isPaid?: boolean;
  };
  taskStatus: 'ongoing' | 'completed' | 'canceled'; // last three status of reservationRequest Model status, you can see the reservationRequest Model

  feedbackByUser?: {
    ratings: number;
    comment: string;
  };

  isDeleted: TIsDeleted;
};

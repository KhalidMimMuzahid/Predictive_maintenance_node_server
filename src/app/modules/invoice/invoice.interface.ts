import { Types } from 'mongoose';

export type TInvoice = {
  invoiceNo: string; // customized unique number

  reservationRequest: Types.ObjectId; // objectId of ReservationRequest  model
  bidWinner: Types.ObjectId; // objectId  of { ServiceProviderCompany or ServiceProviderBranch } or what ?
  invoiceGroup: Types.ObjectId; // objectId of InvoiceGroup model
  user: Types.ObjectId; // objectId of the user model; who raise this reservation

  additionalProducts?: {
    products: {
      productName: string;
      quantity: number;
      // promo:number // percentage of promo ; by default 0%   // is it the same of discount offer? what is actually a promo?
      tax: number; // percentage of tax ; by default 0%
      price: {
        amount: number;
        currency: string;
      };
    }[];
    totalAmount: number;
  };

  feedbackByUser?: {
    ratings: number;
    comment: string;
  };
  taskAssignee: {
    engineer?: Types.ObjectId; // objectId of the engineer; after assigning this task to engineer , this field will be added
    taskStatus: 'pending' | 'accepted' | 'completed';
    comments?: string[]; // ??????
  };
  isDeleted: boolean; // by default false
};


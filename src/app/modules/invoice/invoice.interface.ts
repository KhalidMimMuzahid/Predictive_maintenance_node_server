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
  feedback: {
    reservation: Types.ObjectId; // objectId of reservation Request model,
    user: Types.ObjectId; //ObjectId for User Model;
    ratings: number;
    comment: string;
  };

  isDeleted: boolean; // by default false
};
export type TInvoiceGroup = {
  invoiceGroupNo: string; // customized unique number
  reservationRequestGroup: Types.ObjectId; // objectId of ReservationRequestGroup model
  invoices: Types.ObjectId[]; // objectId of  invoice model
  bidWinner: Types.ObjectId; // objectId  of { ServiceProviderCompany or ServiceProviderBranch } or what ?
  taskAssignee: {
    taskName: string;
    taskDescription: string;
    engineer: Types.ObjectId; // objectId of a Engineer who is working for this company
    taskStatus: 'pending' | 'accepted' | 'completed';
    comments: string[]; // ??????
  }[];

  //   report: {
  //     // maintenance report
  //     cost: { totalCost: number }; // more field can be added
  //   };

  isDeleted: boolean; // by default false
};

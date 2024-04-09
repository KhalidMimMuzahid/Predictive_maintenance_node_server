export type TInvoice = {
  invoiceNo: string; // customized unique number
  reservationRequest: string; // objectId of ReservationRequest model
  bidWinner: string; // objectId  of { ServiceProviderCompany or ServiceProviderBranch } or what ?
  invoiceGroup: string; // objectId of InvoiceGroup model
  user: string; // objectId of the user model; who raise this reservation
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
    reservation: string; // objectId of reservation Request model,
    user: string; //ObjectId for User Model;
    ratings: number;
    comment: string;
  };

  isDeleted: boolean; // by default false
};
export type TInvoiceGroup = {
  invoiceGroupNo: string; // customized unique number
  reservationRequestGroup: string; // objectId of ReservationRequestGroup model
  invoices: string[]; // objectId of  invoice model
  bidWinner: string; // objectId  of { ServiceProviderCompany or ServiceProviderBranch } or what ?
  taskAssignee: {
    taskName: string;
    taskDescription: string;
    engineer: string; // objectId of a Engineer who is working for this company
    taskStatus: 'pending' | 'accepted' | 'completed';
    comments: string[]; // ??????
  }[];

  //   report: {
  //     // maintenance report
  //     cost: { totalCost: number }; // more field can be added
  //   };

  isDeleted: boolean; // by default false
};

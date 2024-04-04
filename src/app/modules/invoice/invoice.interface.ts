export type TInvoice = {
  invoiceNo: string; // customized unique number
  reservationRequest: string; // objectId of ReservationRequest model

  //   additionalProducts?: {
  //     products: [
  //       {
  //         productName: string;
  //         quantity: number;
  //         // promo:number // percentage of promo ; by default 0%   // is it the same of discount offer? what is actually a promo?
  //         tax: number; // percentage of tax ; by default 0%
  //         price: {
  //           amount: number;
  //           currency: string;
  //         };
  //       },
  //     ];
  //     totalAmount: number;
  //   };

  taskAssignee: [
    {
      taskName: string;
      taskDescription: string;
      engineer: string; // objectId of a Engineer who is working for this company
      taskStatus: 'pending' | 'accepted' | 'completed';
      comments: [string]; // ??????
    },
  ];

  //   report: {
  //     // maintenance report
  //     cost: { totalCost: number }; // more field can be added
  //   };
};

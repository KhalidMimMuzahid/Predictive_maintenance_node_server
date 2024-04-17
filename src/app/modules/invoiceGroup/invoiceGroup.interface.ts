import { Types } from 'mongoose';

export type TInvoiceGroup = {
  invoiceGroupNo: string; // customized unique number
  reservationRequestGroup: Types.ObjectId; // objectId of ReservationRequestGroup model
  invoices: Types.ObjectId[]; // objectId of  invoice model
  bidWinner: Types.ObjectId; // objectId  of { ServiceProviderCompany or ServiceProviderBranch } or what ?

  // taskAssignees?: {
  //   invoice: Types.ObjectId; // objectId of invoice model
  //   engineer?: Types.ObjectId; // objectId of the engineer; after assigning this task to engineer , this field will be added
  //   taskStatus: 'pending' | 'accepted' | 'completed';
  //   comments?: string[]; // ??????
  // }[];

  //   report: {
  //     // maintenance report
  //     cost: { totalCost: number }; // more field can be added
  //   };

  isDeleted: boolean; // by default false
};

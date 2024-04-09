import { Types } from 'mongoose';

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

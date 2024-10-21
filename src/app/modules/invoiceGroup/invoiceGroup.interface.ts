import { Types } from 'mongoose';
import { TPostBiddingProcess } from '../reservationGroup/reservationGroup.interface';
import { TIsDeleted } from '../common/common.interface';

export type TInvoiceGroup = {
  invoiceGroupNo: string; // customized unique number
  reservationRequestGroup: Types.ObjectId; // objectId of ReservationRequestGroup model
  invoices: Types.ObjectId[]; // objectId of  invoice model
  postBiddingProcess: TPostBiddingProcess;

  taskAssignee?: {
    teamOfEngineers: Types.ObjectId;

    taskStatus:
      | 'ongoing' // when res req group will be assigned to any team of engineers
      | 'completed' // when all the reservation will be completed
      | 'canceled'; // when res req group or all res req will be canceled
  };
  //   report: {
  //     // maintenance report
  //     cost: { totalCost: number }; // more field can be added
  //   };

  isDeleted: TIsDeleted;
};

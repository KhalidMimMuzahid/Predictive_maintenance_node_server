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
    taskStatus: 'ongoing' | 'completed' | 'canceled';
  };
  //   report: {
  //     // maintenance report
  //     cost: { totalCost: number }; // more field can be added
  //   };

  isDeleted: TIsDeleted;
};

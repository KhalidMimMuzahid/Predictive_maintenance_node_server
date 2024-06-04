import { Types } from 'mongoose';
import { TMachineType } from '../reservation/reservation.interface';
export type TPostBiddingProcess = {
  biddingUser: Types.ObjectId; // ObjectId of User model; who actually bidding this reservation
  serviceProviderCompany: Types.ObjectId; // objectId  of { ServiceProviderCompany or ServiceProviderBranch } or what ?
  serviceProviderBranch: Types.ObjectId; // when we assign this reservation group to a specific branch
  invoiceGroup?: Types.ObjectId; // objectId of InvoiceGroup model; when we assign this to a engineers team
  // biddingAmount: number; //May be we need this;
};
export type TBiddingDate = {
  startDate?: Date;
  endDate?: Date;
};

export type TReservationRequestGroup = {
  groupId: string; // customized unique Identifier
  groupName: string;
  groupForMachineType: TMachineType;
  reservationRequests: Types.ObjectId[]; // objectId of TReservationRequest Model

  biddingDate: TBiddingDate;

  allBids: {
    _id: Types.ObjectId; // mongoose will generate this _id, we no need to think about this
    biddingUser: Types.ObjectId; // ObjectId of User model; who actually bidding this reservation (service provider admin or sub admin)
    serviceProviderCompany: Types.ObjectId; // objectId  of ServiceProviderCompany
    biddingAmount: number; // price for the bid
  }[];

  postBiddingProcess?: TPostBiddingProcess;
};




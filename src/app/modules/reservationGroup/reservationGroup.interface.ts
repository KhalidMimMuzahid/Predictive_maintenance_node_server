import { Types } from 'mongoose';
import { TMachineType } from '../reservation/reservation.interface';

export type TReservationGroupType =
  | 'all'
  | 'pending'
  | 'bid-closed-group'
  | 'assigned-to-company'
  | 'ongoing'
  | 'completed'
  | 'canceled';
  
export type TPostBiddingProcess = {
  biddingUser: Types.ObjectId; // ObjectId of User model; who actually bidding this reservation;  But in onDemand request its a branch manager or service provider admin who accept this request
  serviceProviderCompany: Types.ObjectId; // objectId  of { ServiceProviderCompany or ServiceProviderBranch } or what ?
  serviceProviderBranch: Types.ObjectId; // when we assign this reservation group to a specific branch
  invoiceGroup?: Types.ObjectId; // objectId of InvoiceGroup model; when we assign this to a engineers team
  // biddingAmount: number; //May be we need this;
};

export type TBiddingDate = {
  startDate?: Date;
  endDate?: Date;
};
export type TResGroupCategoryForBranch =
  | 'all'
  | 'scheduled'
  | 're-scheduled'
  | 'ongoing'
  | 'completed';
export type TReservationRequestGroup = {
  groupId: string; // customized unique Identifier
  groupName: string;
  groupForMachineType: TMachineType;
  reservationRequests: Types.ObjectId[]; // objectId of TReservationRequest Model
  taskStatus:
    | 'pending' // when res req group will be created
    | 'accepted' // when res req group will send to any company // select bidding winner
    | 'ongoing' // when this will be assigned to any team of engineers
    | 'completed' // when all of the res  inside this group will  be completed
    | 'canceled'; // when it will  be canceled
  isOnDemand: boolean;

  biddingDate: TBiddingDate;

  allBids: {
    _id: Types.ObjectId; // mongoose will generate this _id, we no need to think about this
    biddingUser: Types.ObjectId; // ObjectId of User model; who actually bidding this reservation (service provider admin or sub admin)
    serviceProviderCompany: Types.ObjectId; // objectId  of ServiceProviderCompany
    biddingAmount: number; // price for the bid
  }[];

  postBiddingProcess?: TPostBiddingProcess;
};

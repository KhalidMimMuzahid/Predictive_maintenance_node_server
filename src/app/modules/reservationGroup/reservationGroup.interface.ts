import { Types } from 'mongoose';

export type TReservationRequestGroup = {
  groupId: string; // customized unique Identifier
  reservationRequest: Types.ObjectId[]; // objectId of TReservationRequest Model
  allBids: {
    bidder: Types.ObjectId; // objectId  of ServiceProviderCompany or ServiceProviderBranch or what ?
    biddingAmount: number; // price for the bid
  }[];
  postBiddingProcess: {
    bidWinner: Types.ObjectId; // objectId  of { ServiceProviderCompany or ServiceProviderBranch } or what ?
    invoiceGroup: Types.ObjectId; // objectId of InvoiceGroup model
  };
};

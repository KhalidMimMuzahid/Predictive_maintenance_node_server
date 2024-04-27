import { Types } from 'mongoose';

export type TReservationRequestGroup = {
  groupId: string; // customized unique Identifier
  reservationRequests: Types.ObjectId[]; // objectId of TReservationRequest Model
  allBids: {
    biddingUser: Types.ObjectId; // ObjectId of User model; who actually bidding this reservation (service provider admin or sub admin)
    // bidder: Types.ObjectId; // objectId  of ServiceProviderCompany or ServiceProviderBranch or what ?
    serviceProviderCompany: Types.ObjectId; // objectId  of ServiceProviderCompany
    biddingAmount: number; // price for the bid
  }[];

  postBiddingProcess?: {
    biddingUser: Types.ObjectId; // ObjectId of User model; who actually bidding this reservation
    bidWinner: Types.ObjectId; // objectId  of { ServiceProviderCompany or ServiceProviderBranch } or what ?
    invoiceGroup: Types.ObjectId; // objectId of InvoiceGroup model
  };
};

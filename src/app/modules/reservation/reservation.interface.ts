import { TAddress } from '../common/common.interface';

export type TReservationRequest = {
  user: string; // objectId of the user model
  requestId: string; // customized unique Identifier
  machine: string; //ObjectId for Machine Model;
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'canceled'; // reservation request status; we have another status --> "expired" , we can generate this status in frontend by checking, if status is not completed and also the last date of schedule list is over
  date: Date; // date when the reservation arises
  location: TAddress; // where this machine is located
  isSensorConnected: boolean; // machineType as figma; true if sensor is sensor-connected, false if not sensor-non-connected
  problem: {
    issues: { title: string; issue: string }[]; // all issues title one by one
    problemDescription: string;
    images: { image: string; title?: string; comment: string }[];
  };
  schedule: {
    category:
      | 'on-demand'
      | 'within-one-week'
      | 'within-two-week'
      | 'custom-date-picked';
    date: Date;
    schedules: Date[]; // every schedule will be stored here , if you re schedule this request 5 times, this array will hold five different date
  };
  invoice: string; // objectId of invoice Model for this reservation

  reservationRequestGroup?: string; // objectId of reservationGroup
};

export type TReservationRequestGroup = {
  groupId: string; // customized unique Identifier
  reservationRequest: string[]; // objectId of TReservationRequest Model
  invoiceGroup?: string; // objectId of InvoiceGroup model
  allBids: {
    bidder: string; // objectId  of ServiceProviderCompany or ServiceProviderBranch or what ?
    biddingAmount: number; // price for the bid
  }[];
  postBiddingProcess: {
    bidWinner: string; // objectId  of { ServiceProviderCompany or ServiceProviderBranch } or what ?
    invoiceGroup: string; // objectId of InvoiceGroup model
  };
};

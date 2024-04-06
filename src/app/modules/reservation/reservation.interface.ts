import { TAddress } from '../common/common.interface';

export type TReservationRequest = {
  requestId: string; // customized unique Identifier
  machine: string; //ObjectId for Machine Model;
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'canceled'; // reservation request status; we have another status --> "expired" , we can generate this status in frontend by checking, if status is not completed and also the last date of schedule list is over
  date: Date; // date when the reservation arises
  location: TAddress; // where this machine is located
  isSensorConnected: boolean; // machineType as figma; true if sensor is sensor-connected, false if not sensor-non-connected
  problem: {
    issues: [{ title: string; issue: string }]; // all issues title one by one
    problemDescription: string;
    images: [{ image: string; title?: string; comment: string }];
  };
  schedule: {
    category:
      | 'on-demand'
      | 'within-one-week'
      | 'within-two-week'
      | 'custom-date-picked';
    date: Date;
    schedules: [Date]; // every schedule will be stored here , if you re schedule this request 5 times, this array will hold five different date
  };

  // we may transfer this feedback type to invoice interface
  feedback: {
    user: string; //ObjectId for User Model;
    ratings: number;
    message: string;
  };

  allBids: [
    {
      bidder: string; // objectId  of ServiceProviderCompany or ServiceProviderBranch or what ?
      biddingAmount: number; // price for the bid
    },
  ];

  postBiddingProcess: {
    bidWinner: string; // objectId  of { ServiceProviderCompany or ServiceProviderBranch } or what ?
    invoice: string; // objectId of Invoice model
  };
};

export type TReservationRequestGroup = {
  groupId: string; // customized unique Identifier
  reservationRequest: [string]; // objectId of TReservationRequest Model
};

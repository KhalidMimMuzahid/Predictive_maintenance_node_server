import { Types } from 'mongoose';



export type TMachineType = 'connected' | 'non-connected';

export type TReservationType =
  | 'all'
  | 'on-demand'
  | 'within-one-week'
  | 'within-two-week'
  | 'scheduled'
  | 'rescheduled'
  | 'pending'
  | 'accepted'
  | 'ongoing'
  | 'completed';
  
  export type TReservationTypeForCount =
    | 'all'
    | 'on-demand'
    | 'accepted'
    | 'ongoing'
    | 'completed'
    | 'canceled';

export type TProblem = {
  issues: string[]; // all issues title one by one
  problemDescription?: string;
  images: { image: string; title?: string }[];
}; 
export type TSchedule = {
  category:
    | 'on-demand'
    | 'within-one-week'
    | 'within-two-week'
    | 'custom-date-picked';
  // date: Date;
  schedules: Date[]; // every schedule will be stored here , if you re schedule this request 5 times, this array will hold five different date
};
export type TReservationRequest = {
  user: Types.ObjectId; // objectId of the user model
  requestId: string; // customized unique Identifier
  machine: Types.ObjectId; //ObjectId for Machine Model;
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'canceled'; // reservation request status; we have another status --> "expired" , we can generate this status in frontend by checking, if status is not completed and also the last date of schedule list is over
  date: Date; // date when the reservation arises
  // location: TAddress; // where this machine is located
  isSensorConnected: boolean; // machineType as figma; true if sensor is sensor-connected, false if not sensor-non-connected
  machineType: 'washing-machine' | 'general-machine';
  problem: TProblem;
  schedule: TSchedule;
  invoice: Types.ObjectId; // objectId of invoice Model for this reservation

  reservationRequestGroup?: Types.ObjectId; // objectId of reservationGroup
};

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

export type TProblem = {
  issues: string[]; // all issues title one by one
  problemDescription?: string;
  images: { image: string; title?: string }[];
};

export type TPeriod = 'weekly' | 'monthly' | 'yearly';

export type TSchedule = {
  category:
    | 'on-demand'
    | 'within-one-week'
    | 'within-two-week'
    | 'custom-date-picked';
  // date: Date;
  schedules: Date[]; // every schedule will be stored here , if you re schedule this request 5 times, this array will hold five different date
};

export type TReservationStatus =
  | 'pending' // when res req will be created
  | 'accepted' // when res req group will send to any company // select bidding winner
  | 'ongoing' // when res req will be assigned to any team of engineers
  | 'completed' // when the res will  be completed
  | 'canceled'; // when res req will be canceled
// we have another status --> "expired" , we can generate this status in frontend by checking, if status is not completed and also the last date of schedule list is over

export type TMachineType2 = 'washing-machine' | 'general-machine';
export type TReservationRequest = {
  isValid: boolean; // to generate ai performance
  user: Types.ObjectId; // objectId of the user model
  requestId: string; // customized unique Identifier
  machine: Types.ObjectId; //ObjectId for Machine Model;
  status: TReservationStatus;
  // date: Date; // date when the reservation arises
  // location: TAddress; // where this machine is located
  isSensorConnected: boolean; // machineType as figma; true if sensor is sensor-connected, false if not sensor-non-connected
  machineType: TMachineType2;
  problem: TProblem;
  schedule: TSchedule;
  reasonOfReSchedule: string; // service provider engineer will set this value
  invoice: Types.ObjectId; // objectId of invoice Model for this reservation
  reservationRequestGroup?: Types.ObjectId; // objectId of reservationGroup
};

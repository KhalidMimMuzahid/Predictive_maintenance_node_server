import {
  TMachineType,
  TMachineType2,
  TReservationType,
} from './reservation.interface';

export const machineTypeArray: TMachineType[] = ['connected', 'non-connected'];
export const reservationTypeArray: TReservationType[] = [
  'all',
  'on-demand',
  'within-one-week',
  'within-two-week',
  'scheduled',
  'rescheduled',
  'pending',
  'accepted',
  'ongoing',
  'completed',
];
export const machineTypeArray2: TMachineType2[] = [
  'washing-machine',
  'general-machine',
];



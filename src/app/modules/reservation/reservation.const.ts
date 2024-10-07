import {
  TMachineType,
  TMachineType2,
  TPeriod,
  TReservationStatus,
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
export const resTypeArrayForServiceProvider = [
  'ongoing',
  'completed',
  'canceled',
  'rescheduled',
];
export const machineTypeArray2: TMachineType2[] = [
  'washing-machine',
  'general-machine',
];

export const periodTypeArray: TPeriod[] = ['weekly', 'monthly', 'yearly'];

export const reservationStatusTypeArray: TReservationStatus[] = [
  'pending',
  'accepted',
  'ongoing',
  'completed',
  'canceled',
];

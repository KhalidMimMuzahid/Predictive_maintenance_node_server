import { TAssignedTaskType, TInvoiceStatus } from './invoice.interface';

export const invoiceStatusArray: TInvoiceStatus[] = [
  'ongoing',
  'completed',
  'canceled',
];

export const assignedTaskTypeArray: TAssignedTaskType[] = [
  'all',
  'inspection',
  'schedule',
  'pending',
  'completed',
];

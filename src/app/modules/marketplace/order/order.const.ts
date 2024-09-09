import { TActionTypeForChangesStatus } from './order.interface';

export const paymentTypesArray = ['cash-on-delivery', 'showa-balance'];
export const orderStatusArray = [
  'pending',
  'inprogress',
  'shipped',
  'delivered',
  'canceled',
];
export const actionTypeArray = ['cancel', 'accept'];
export const actionTypeForChangesStatus: TActionTypeForChangesStatus[] = [
  'inprogress',
  'shipped',
];

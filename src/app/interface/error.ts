import { Types } from 'mongoose';
import { TRole } from '../modules/user/user.interface';

export type TErrorSources = { path: string | number; message: string }[];

export type TGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorSources: TErrorSources;
};

export type TAuth = {
  email: string;
  _id: Types.ObjectId;
  uid: string;
  role: TRole;
};

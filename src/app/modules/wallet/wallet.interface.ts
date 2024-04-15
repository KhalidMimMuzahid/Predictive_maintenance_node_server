/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import { TCard } from '../common/common.interface';

export type TWallet = {
  user: Types.ObjectId; // it user is ObjectId of the user model
  cards: { card: TCard; isDeleted: boolean }[];
  stripeCustomerId?: string;
  bankAccount?: Record<string, any>;
  balance: number; //
  point: number; //
  showaMB: number; // ?????????
};

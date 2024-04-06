/* eslint-disable @typescript-eslint/no-explicit-any */
import { TCard } from '../common/common.interface';

export type TWallet = {
  user: string; // it user is ObjectId of the user model
  cards: [{ card: TCard; isDeleted: boolean }];
  bankAccount: Record<string, any>;
  balance: number; //
  point: number; //
  showaMB: number; // ?????????
};

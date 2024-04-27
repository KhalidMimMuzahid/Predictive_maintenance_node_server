import { z } from 'zod';

const createReservationGroupSchema = z.object({
  reservationRequests: z.array(z.string()),
});

const addBidSchema = z.object({
  biddingAmount: z.number().min(10, 'bidding Amount can not be less that one'),
});

export const reservationGroupValidation = {
  createReservationGroupSchema,
  addBidSchema,
};

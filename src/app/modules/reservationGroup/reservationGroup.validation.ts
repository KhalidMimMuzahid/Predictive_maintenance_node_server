import { z } from 'zod';

const createReservationGroupSchema = z.object({
  biddingDate: z
    .object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
    .optional()
    .refine(
      (date) => {
        if (date) {
          const { startDate, endDate } = date;
          if (startDate || endDate) {
            try {
              if (startDate && endDate) {
                return (
                  new Date(endDate) > new Date(startDate) &&
                  new Date(endDate) > new Date() &&
                  new Date(startDate) > new Date()
                );
              } else if (startDate) {
                return new Date(startDate) > new Date();
              } else if (!startDate && endDate) {
                return new Date(endDate) > new Date();
              }
            } catch (error) {
              return false;
            }
          } else {
            return true;
          }
        } else {
          return true;
        }
      },

      {
        message:
          'Please follow the rules for setting bid starting and ending date',
        path: ['date'],
      },
    ),

  reservationRequests: z.array(z.string()),
});


  

const setBiddingDateSchema = z.object({
  biddingDate: z
    .object({
      startDate: z.string(),
      endDate: z.string().optional(),
    })
    .refine(
      (date) => {
        if (date) {
          const { startDate, endDate } = date;
          if (startDate || endDate) {
            try {
              if (startDate && endDate) {
                return (
                  new Date(endDate) > new Date(startDate) &&
                  new Date(endDate) > new Date() &&
                  new Date(startDate) > new Date()
                );
              } else if (startDate) {
                return new Date(startDate) > new Date();
              } else if (!startDate && endDate) {
                return new Date(endDate) > new Date();
              }
            } catch (error) {
              return false;
            }
          } else {
            return true;
          }
        } else {
          return true;
        }
      },

      {
        message:
          'Please follow the rules for setting bid starting and ending date',
        path: ['date'],
      },
    ),
});

const addBidSchema = z.object({
  biddingAmount: z.number().min(1, 'bidding Amount can not be less that one'),
});

export const reservationGroupValidation = {
  createReservationGroupSchema,
  setBiddingDateSchema,
  addBidSchema,
};

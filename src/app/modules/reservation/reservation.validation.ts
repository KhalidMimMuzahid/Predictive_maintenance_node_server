import { z } from 'zod';

export const createProblemValidationSchema = z.object({
  issues: z.array(z.string()),
  problemDescription: z.string().optional(),
  images: z
    .array(
      z.object({
        image: z.string(),
        title: z.string().optional(),
      }),
    )
    .optional(),
});
//
export const createScheduleValidationSchema = z.object({
  category: z.enum([
    'on-demand',
    'within-one-week',
    'within-two-week',
    'custom-date-picked',
  ]),
  schedules: z.array(z.string()).optional(),
});

const createReservationValidationSchema = z.object({
  problem: createProblemValidationSchema,
  schedule: createScheduleValidationSchema,
});



export const rescheduleSchema = z.object({
  rescheduleData: z
    .object({
      schedule: z.string(),
      reasonOfReSchedule: z.string().optional(),
    })
    .refine(
      (date) => {
        if (date) {
          try {
            const { schedule } = date;
            const scheduleDate = new Date(schedule);
            if (scheduleDate > new Date()) {
              return true;
            } else {
              return false;
            }
          } catch (error) {
            return false;
          }
        } else {
          return true;
        }
      },

      {
        message: 'Please follow the rules of rescheduling date',
        path: ['date'],
      },
    ),
});
export const reservationValidation = {
  createReservationValidationSchema,
  rescheduleSchema,
};

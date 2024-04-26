import { z } from 'zod';

export const createProblemValidationSchema = z.object({
  issues: z.array(
    z.object({
      title: z.string(),
      issue: z.string(),
    }),
  ),
  problemDescription: z.string().optional(),
  images: z
    .array(
      z.object({
        image: z.string(),
        title: z.string(),
      }),
    )
    .optional(),
});

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
  problem: createScheduleValidationSchema,
  schedule: createScheduleValidationSchema,
});
export const reservationValidation = {
  createReservationValidationSchema,
};

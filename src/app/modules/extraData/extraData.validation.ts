import { z } from 'zod';

const addFeedbackValidationSchema = z.object({
  title: z.string(),
  photos: z
    .array(
      z.object({
        photoUrl: z.string().url(),
        title: z.string().optional(),
      }),
    )
    .optional(),
});

export const extraDataValidation = {
  addFeedbackValidationSchema,
};

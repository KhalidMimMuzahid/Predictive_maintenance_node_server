import { z } from 'zod';

export const messageValidationSchema = z.object({
  type: z.enum(['message', 'file']),
  message: z.string().optional(),

  file: z
    .object({
      url: z.string(),
      fileName: z.string(),
      fileType: z.string(),
    })
    .optional(),
});

export const messageValidation = {
  messageValidationSchema,
};

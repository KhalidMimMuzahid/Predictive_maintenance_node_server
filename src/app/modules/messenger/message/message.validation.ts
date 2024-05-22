import { z } from 'zod';

export const messageValidationSchema = z.object({
  type: z.enum(['message', 'file']),
  message: z.string().optional(),

  file: z
    .object({
      fileUrl: z.string(),
      fileName: z.string(),
      extension: z.string(),
    })
    .optional(),
});

export const messageValidation = {
  messageValidationSchema,
};

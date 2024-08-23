import { z } from 'zod';

const thresholdSchema = z.object({
  sectionName: z.string(),
  temperature: z.number().optional(),
  vibrations: z.number().optional(),
});

// const AISchema = z.object({
//   type: z.enum(['threshold']),
//   threshold: ThresholdSchema.optional(),
// });

export const aiValidation = { thresholdSchema };

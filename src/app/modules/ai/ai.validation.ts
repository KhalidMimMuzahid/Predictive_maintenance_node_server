import { z } from 'zod';

const thresholdSchema = z.object({
  category: z.enum(['washing-machine', 'general-machine']),
  type: z.string(),
  brand: z.string(),
  model: z.string(),
  sectionName: z.string(),
  temperature: z.number().optional(),
  vibrations: z.number().optional(),
});

// const AISchema = z.object({
//   type: z.enum(['threshold']),
//   threshold: ThresholdSchema.optional(),
// });

export const aiValidation = { thresholdSchema };

import { z } from 'zod';

const teamOfEngineersCreateValidationSchema = z.object({
  serviceProviderEngineers: z.array(z.string()),
  teamName: z.string(),
});

export const teamOfEngineersValidation = {
  teamOfEngineersCreateValidationSchema,
};

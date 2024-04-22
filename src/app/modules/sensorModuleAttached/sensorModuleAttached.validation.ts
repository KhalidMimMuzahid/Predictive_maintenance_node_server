import { z } from 'zod';
export const createSensorModuleAttachedSchema = z.object({
  sectionName: z.string(),
  purpose: z.string().optional(),
});

export const sensorModuleAttachedValidation = {
  createSensorModuleAttachedSchema,
};

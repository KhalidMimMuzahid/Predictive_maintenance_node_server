import { z } from 'zod';
export const createSensorModuleAttachedSchema = z.object({
  sectionName: z.object({
    vibration: z.array(z.string()),
    temperature: z.array(z.string()),
  }),
  purpose: z.string().optional(),
});

const moduleOneSchema = z.object({
  vibration: z.array(z.number()).length(1),
  temperature: z.array(z.number()).length(1),
});
const moduleTwoSchema = z.object({
  vibration: z.array(z.number()).length(3),
  temperature: z.array(z.number()).length(1),
});
const moduleThreeSchema = z.object({
  vibration: z.array(z.number()).length(6),
  temperature: z.array(z.number()).length(3),
});
const moduleFourSchema = z.object({
  vibration: z.array(z.number()).length(6),
  temperature: z.array(z.number()).length(6),
});
export const sensorDataValidationSchema = {
  moduleOneSchema,
  moduleTwoSchema,
  moduleThreeSchema,
  moduleFourSchema,
};

const moduleOneSchemaForSectionNames = z.object({
  vibration: z.array(z.string()).length(1),
  temperature: z.array(z.string()).length(1),
});
const moduleTwoSchemaForSectionNames = z.object({
  vibration: z.array(z.string()).length(3),
  temperature: z.array(z.string()).length(1),
});
const moduleThreeSchemaForSectionNames = z.object({
  vibration: z.array(z.string()).length(6),
  temperature: z.array(z.string()).length(3),
});
const moduleFourSchemaForSectionNames = z.object({
  vibration: z.array(z.string()).length(6),
  temperature: z.array(z.string()).length(6),
});
export const sectionNamesDataValidationSchema = {
  moduleOneSchemaForSectionNames,
  moduleTwoSchemaForSectionNames,
  moduleThreeSchemaForSectionNames,
  moduleFourSchemaForSectionNames,
};
export const sensorModuleAttachedValidation = {
  createSensorModuleAttachedSchema,
};

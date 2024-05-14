import { z } from 'zod';
export const createSensorModuleAttachedSchema = z.object({
  sectionName: z.string(),
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
export const sensorModuleAttachedValidation = {
  createSensorModuleAttachedSchema,
};

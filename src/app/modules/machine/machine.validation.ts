import { z } from 'zod';
import { createAddressValidationSchema } from '../common/common.validation';
import { createSensorModuleAttachedSchema } from '../sensorModuleAttached/sensorModuleAttached.validation';

export const createCompanyValidationSchema = z.object({
  category: z.enum(['home', 'shop', 'company', 'others']),
  name: z.string().min(1),
  type: z.string().min(1),
  address: createAddressValidationSchema,
});

// Define validation schema for MachineSchema
export const createMachineValidationSchema = z.object({
  category: z.enum(['washing-machine', 'general-machine']),
  name: z.string().min(1),
  // address: createAddressValidationSchema.optional(),
  usedFor: createCompanyValidationSchema.optional(),
  generalMachine: z
    .object({
      homeName: z.string(),
      homeType: z.string(),
    })
    .optional(),
  washingMachine: z
    .object({
      type: z.string(),
    })
    .optional(),
  brand: z.string().min(1),
  model: z.string().min(1),
  environment: z.enum(['indoor', 'outdoor']),
});
const createNonConnectedMachineValidationSchema = createMachineValidationSchema;

const createConnectedMachineValidationSchema = z.object({
  machine: createMachineValidationSchema,
  sensorModuleAttached: createSensorModuleAttachedSchema,
});
const healthStatusesSchema = z.object({
  sectionName: z.string(),
  sensorData: z.object({
    vibration: z.number(),
    temperature: z.number(),
  }),
  healthStatus: z.enum(['bad', 'good', 'moderate']),
});
const machineHealthStatusSchema = z.object({
  healthStatus: z.enum(['bad', 'good', 'moderate']),
  issues: z.array(z.string()),
  healthStatuses: z.array(healthStatusesSchema),
});


const durationDateSchema = z.object({
  duration: z
    .object({
      startDate: z.string(),
      endDate: z.string(),
    })
    .refine(
      (date) => {
        if (date) {
          const { startDate, endDate } = date;

          try {
            return (
              new Date(endDate) > new Date(startDate) &&
              // new Date(endDate) < new Date() &&
              new Date(startDate) < new Date()
            );
          } catch (error) {
            return false;
          }
        } else {
          return true;
        }
      },

      {
        message:
          'Please follow the rules for setting bid starting and ending date',
        path: ['date'],
      },
    ),
});
export const machineValidation = {
  createNonConnectedMachineValidationSchema,
  createConnectedMachineValidationSchema,
  machineHealthStatusSchema,
  durationDateSchema,
};



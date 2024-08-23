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
  usedFor: createCompanyValidationSchema,
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
const sensorModuleSchema = z.object({
  _id: z.string(),
  sensorData: z.array(
    z.object({
      vibration: z.array(z.number()),
      temperature: z.array(z.number()),
    }),
  ),
  moduleType: z.string(),
  sectionName: z.object({
    vibration: z.array(z.string()),
    temperature: z.array(z.string()),
  }),
  healthStatuses: z.object({
    vibration: z.array(z.enum(['bad', 'good', 'moderate'])),
    temperature: z.array(z.enum(['bad', 'good', 'moderate'])),
  }),
});
const machineHealthStatusSchema = z.object({
  healthStatus: z.enum(['bad', 'good', 'moderate']),
  issues: z.array(z.string()),
  sensorModulesAttached: z.array(sensorModuleSchema),
});
export const machineValidation = {
  createNonConnectedMachineValidationSchema,
  createConnectedMachineValidationSchema,
  machineHealthStatusSchema,
};

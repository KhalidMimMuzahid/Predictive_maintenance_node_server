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
export const machineValidation = {
  createNonConnectedMachineValidationSchema,
  createConnectedMachineValidationSchema,
};

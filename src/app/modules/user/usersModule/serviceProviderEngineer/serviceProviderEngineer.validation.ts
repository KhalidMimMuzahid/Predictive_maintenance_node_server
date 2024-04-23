import { z } from 'zod';
import { rootUserCreateValidationSchema } from '../../user.validation';

const serviceProviderEngineerCreateValidationSchema = z.object({
  name: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
});

const userCreateValidationSchema = z.object({
  rootUser: rootUserCreateValidationSchema,
  serviceProviderEngineer: serviceProviderEngineerCreateValidationSchema,
});

export const serviceProviderEngineerValidation = { userCreateValidationSchema };

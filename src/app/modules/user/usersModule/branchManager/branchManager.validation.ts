import { z } from 'zod';
import { rootUserCreateValidationSchema } from '../../user.validation';

const serviceProviderBranchManagerCreateValidationSchema = z.object({
  name: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
  photoUrl: z.string().optional(),
  nid: z
    .object({
      frontPhotoUrl: z.string(),
      backPhotoUrl: z.string(),
    })
    .optional(),
});

const userCreateValidationSchema = z.object({
  rootUser: rootUserCreateValidationSchema,
  serviceProviderBranchManager:
    serviceProviderBranchManagerCreateValidationSchema,
});

export const serviceProviderBranchManagerValidation = {
  userCreateValidationSchema,
};

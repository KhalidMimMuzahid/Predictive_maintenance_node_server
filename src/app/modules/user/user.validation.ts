import { z } from 'zod';
import { updateAddressValidationSchema } from '../common/common.validation';

// Define validation schema for TUser
export const rootUserCreateValidationSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  phone: z.string(),
});
export const editUserValidationSchema = z.object({
  user: z.object({
    userName: z.string().optional(),
    bio: z.string().optional(),
    website: z.string().optional(),
  }),

  showaUser: z
    .object({
      name: z
        .object({
          firstName: z.string(),
          lastName: z.string(),
        })
        .optional(),
      occupation: z.string().optional(),
      dateOfBirth: z.string().optional(),
      photoUrl: z.string().optional(),
      coverPhotoUrl: z.string().optional(),
      addresses: updateAddressValidationSchema.optional(),
    })
    .optional(),
  serviceProviderAdmin: z
    .object({
      name: z
        .object({
          firstName: z.string(),
          lastName: z.string(),
        })
        .optional(),
      occupation: z.string().optional(),
      dateOfBirth: z.string().optional(),
      photoUrl: z.string().optional(),
      coverPhotoUrl: z.string().optional(),
      addresses: updateAddressValidationSchema.optional(),
    })
    .optional(),
  serviceProviderBranchManager: z
    .object({
      name: z
        .object({
          firstName: z.string(),
          lastName: z.string(),
        })
        .optional(),
      occupation: z.string().optional(),
      dateOfBirth: z.string().optional(),
      photoUrl: z.string().optional(),
      coverPhotoUrl: z.string().optional(),
      addresses: updateAddressValidationSchema.optional(),
    })
    .optional(),
  serviceProviderEngineer: z
    .object({
      name: z
        .object({
          firstName: z.string(),
          lastName: z.string(),
        })
        .optional(),
      occupation: z.string().optional(),
      dateOfBirth: z.string().optional(),
      photoUrl: z.string().optional(),
      coverPhotoUrl: z.string().optional(),
      addresses: updateAddressValidationSchema.optional(),
    })
    .optional(),
});

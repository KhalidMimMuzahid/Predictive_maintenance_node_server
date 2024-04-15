import { z } from 'zod';

// Define validation schema for TAddress
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  prefecture: z.string(),
  postalCode: z.string(),
  country: z.string(),
  buildingName: z.string(),
  roomNumber: z.string(),
  state: z.string().optional(),
  details: z.string().optional(),
});

// Define validation schema for TLanguage
const languageSchema = z.object({
  katakana: z
    .object({
      name: z.object({
        firstName: z.string(),
        lastName: z.string(),
      }),
    })
    .optional(),
  korean: z
    .object({
      name: z.object({
        firstName: z.string(),
        lastName: z.string(),
      }),
    })
    .optional(),
});

// // Define validation schema for TRole
// const roleSchema = z.enum([
//   'showa-user',
//   'showa-admin',
//   'showa-sub-admin',
//   'service-provider-admin',
//   'service-provider-sub-admin',
//   'service-provider-engineer',
//   'service-provider-branch-manager',
//   'service-provider-support-stuff',
// ]);

// Define validation schema for TUser
const userCreateValidationSchema = z.object({
  uid: z.string(),
  name: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
  language: languageSchema.optional(),
  email: z.string().email(),
  phone: z.string(),
  occupation: z.string(),
  dateOfBirth: z.string(), // for now its string; but it will be date in production
  photoUrl: z.string().optional(),
  gender: z.enum(['male', 'female', 'prefer-not-answer']),
  //   role: roleSchema, // user will not send this role info
  addresses: z.array(
    z.object({
      isDeleted: z.boolean(),
      address: addressSchema,
    }),
    // .optional(),  for showa normal user, they must have address
  ),
  //   wallet: z.string().optional(), // user will not send this wallet )_id
  //   status: z.enum(['in-progress', 'restricted', 'approved']), // user will not send this info
  //   isDeleted: z.boolean(),  // user will not send this info
  //   engineer: z.string().optional(),
});

export const userValidation = { userCreateValidationSchema };

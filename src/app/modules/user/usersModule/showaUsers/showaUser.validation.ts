import { z } from 'zod';
import { createAddressValidationSchema } from '../../../common/common.validation';
import { rootUserCreateValidationSchema } from '../../user.validation';

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
  kanji: z
    .object({
      name: z.object({
        firstName: z.string(),
        lastName: z.string(),
      }),
    })
    .optional(),
});

const showaUserCreateValidationSchema = z.object({
  name: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
  language: languageSchema.optional(),

  // phone: z.string(),
  occupation: z.string(),
  dateOfBirth: z.string(), // for now its string; but it will be date in production
  gender: z.enum(['male', 'female', 'prefer-not-answer']),
  photoUrl: z.string().optional(),

  //   role: roleSchema, // user will not send this role info
  addresses: z.array(
    z
      .object({
        isDeleted: z.boolean(),
        address: createAddressValidationSchema,
      })
      .optional(),
  ),
});
const userCreateValidationSchema = z.object({
  rootUser: rootUserCreateValidationSchema,
  showaUser: showaUserCreateValidationSchema,
});

export const showaUserValidation = { userCreateValidationSchema };

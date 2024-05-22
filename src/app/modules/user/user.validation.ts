import { z } from 'zod';

// Define validation schema for TUser
export const rootUserCreateValidationSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  phone: z.string(),
});

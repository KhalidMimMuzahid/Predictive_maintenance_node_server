import { z } from 'zod';

// Define validation schema for TAddress
export const createAddressValidationSchema = z.object({
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

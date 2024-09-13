import { z } from 'zod';

// Define validation schema for TAddress
export const createAddressValidationSchema = z.object({
  googleString: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  prefecture: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string(),
  buildingName: z.string().optional(),
  roomNumber: z.string().optional(),
  state: z.string().optional(),
  details: z.string().optional(),
});

export const createCardValidationSchema = z.object({
  cardType: z.enum(['debit', 'credit']),
  cardName: z.string(),
  cardNumber: z.number(),
  cardHolderName: z.string(),
  address: createAddressValidationSchema,
  expDate: z.string(), // for now its string; but it will be date in production
  country: z.string(),
  cvc_cvv: z.string(),
});

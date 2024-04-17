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
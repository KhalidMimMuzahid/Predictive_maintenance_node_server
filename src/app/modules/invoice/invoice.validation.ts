import { z } from 'zod';

export const addAdditionalProductValidationSchema = z.object({
  productName: z.string(),
  cost: z.object({
    price: z.number().min(10),
    quantity: z.number().min(1),
    tax: z.number().optional(),
  }),
});

export const invoiceValidation = { addAdditionalProductValidationSchema };

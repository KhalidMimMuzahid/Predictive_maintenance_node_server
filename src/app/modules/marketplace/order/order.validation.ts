import { z } from 'zod';

const orderValidationSchema = z.object({
  orders: z.array(
    z.object({
      product: z.string(),
      quantity: z.number(),
    }),
  ),
});
export const orderValidation = {
  orderValidationSchema,
};

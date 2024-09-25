import { z } from 'zod';

const orderValidationSchema = z.object({
  orders: z.array(
    z.object({
      product: z.string(),
      quantity: z.number(),
    }),
  ),
});
const changeStatusValidationSchema = z.object({
  date: z.string().refine(
    (dateString) => {
      if (dateString) {
        try {
          const date = new Date(dateString);

          // Check if date is valid
          return !isNaN(date.getTime());
        } catch (error) {
          return false;
        }
      } else {
        return true;
      }
    },

    {
      message: 'Please follow the rules for date string',
      path: ['date'],
    },
  ),
});
export const orderValidation = {
  orderValidationSchema,
  changeStatusValidationSchema,
};

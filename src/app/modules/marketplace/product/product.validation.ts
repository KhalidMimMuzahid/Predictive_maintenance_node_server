import { z } from 'zod';

const createProductValidationSchema = z.object({
  name: z.string(),
  details: z.string(),
  model: z.string(),
  brand: z.string(),
  category: z.string(),
  subCategory: z.string(),
  regularPrice: z.number(),
  salePrice: z.number(),
  taxStatus: z.enum(['applicable', 'not-applicable']),
  taxStatusClass: z.string(),
  size: z.array(z.string()),
  weight: z.number(),
  length: z.number(),
  width: z.number(),
  height: z.number(),

  stockManagement: z.object({
    availableStock: z.number(),
    stockKeepingUnit: z.number(),
    stockStatus: z.enum(['available', 'not-available']),
    individualSold: z.boolean(),
    trackStockQuantity: z.boolean(),
  }),
  photos: z.array(
    z.object({
      photoUrl: z.string().url(),
      color: z.string(),
      title: z.string(),
    }),
  ),
  feedback: z
    .object({
      rate: z.number().min(0).max(5),
      reviews: z
        .array(
          z.object({
            review: z.string(),
            rate: z.number().min(0).max(5),
            user: z.string().refine((val) => /^[a-fA-F0-9]{24}$/.test(val), {
              message: 'Invalid ObjectId format',
            }),
          }),
        )
        .optional(),
    })
    .optional(),
});
export const productValidation = {
  createProductValidationSchema,
};

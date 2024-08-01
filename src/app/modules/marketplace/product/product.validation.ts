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
  taxRate: z.number(),
  size: z.array(z.string()),

  packageSize: z.object({
    weight: z.number(),
    length: z.number(),
    width: z.number(),
    height: z.number(),
  }),

  stockManagement: z.object({
    availableStock: z.number(),
    trackStockQuantity: z.boolean(),
  }),
  photos: z
    .array(
      z.object({
        photoUrl: z.string().url(),
        color: z.string().optional(),
        title: z.string().optional(),
      }),
    )
    .optional(),
});

const reviewValidationSchema = z.object({
  rate: z.number().min(1).max(5),
  review: z.string(),
});
export const productValidation = {
  createProductValidationSchema,
  reviewValidationSchema,
};

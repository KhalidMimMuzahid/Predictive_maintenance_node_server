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
  size: z.array(z.string()).optional(),

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

const editProductValidationSchema = z.object({
  name: z.string().optional(),
  details: z.string().optional(),
  // model: z.string(),
  // brand: z.string(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  regularPrice: z.number().optional(),
  salePrice: z.number().optional(),
  taxStatus: z.enum(['applicable', 'not-applicable']).optional(),
  taxRate: z.number().optional(),
  // size: z.array(z.string()).optional().optional(),

  packageSize: z
    .object({
      weight: z.number().optional(),
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),

  stockManagement: z
    .object({
      availableStock: z.number().optional(),
      trackStockQuantity: z.boolean().optional(),
    })
    .optional(),
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
  editProductValidationSchema,
  reviewValidationSchema,
};

import { z } from 'zod';

// Define the zod schema for price
const priceSchema = z.object({
  netAmount: z.number(),
  discount: z
    .object({
      type: z.enum(['percentage', 'flat-rate']),
      amount: z.number(),
    })
    .optional(),
});

// Define the zod schema for showaUser
const showaUserSchema = z.object({
  packageType: z.enum(['premium', 'standard', 'basic']),
  premium: z
    .object({
      totalMachine: z.number().refine((val) => val !== undefined, {
        message: 'Required for premium package',
        path: ['packageType'],
      }),
      totalIOT: z.number().refine((val) => val !== undefined, {
        message: 'Required for premium package',
        path: ['packageType'],
      }),
      applicableModules: z
        .array(z.enum(['module-1', 'module-2', 'module-3', 'module-4']))
        .refine((val) => val !== undefined, {
          message: 'Required for premium package',
          path: ['packageType'],
        }),
      validity: z.number().refine((val) => val !== undefined, {
        message: 'Required for premium package',
        path: ['packageType'],
      }),
    })
    .optional(),
  standard: z
    .object({
      totalMachine: z.number().refine((val) => val !== undefined, {
        message: 'Required for standard package',
        path: ['packageType'],
      }),
      validity: z.number().refine((val) => val !== undefined, {
        message: 'Required for standard package',
        path: ['packageType'],
      }),
    })
    .optional(),
  basic: z
    .object({
      showaMB: z.number().refine((val) => val !== undefined, {
        message: 'Required for basic package',
        path: ['packageType'],
      }),
      totalIOT: z.number().refine((val) => val !== undefined, {
        message: 'Required for basic package',
        path: ['packageType'],
      }),
      applicableModules: z
        .array(z.enum(['module-1', 'module-2', 'module-3', 'module-4']))
        .refine((val) => val !== undefined, {
          message: 'Required for basic package',
          path: ['packageType'],
        }),
      validity: z.number().refine((val) => val !== undefined, {
        message: 'Required for basic package',
        path: ['packageType'],
      }),
    })
    .optional(),
});

// Define the zod schema for package
const packageSchema = z.object({
  packageFor: z.enum(['showaUser', 'serviceProviderCompany']),
  showaUser: showaUserSchema.optional(),
  // Uncomment and define serviceProviderCompany schema if needed
  // serviceProviderCompany: z.object({
  //   totalEngineer: z.number(),
  // }).optional(),
});

// Define the zod schema for subscription
const createSubscriptionSchema = z.object({
  subscriptionTitle: z.string(),
  package: packageSchema,
  price: priceSchema,
  features: z.array(z.string()),
});
export const subscriptionValidation = {
  createSubscriptionSchema,
};

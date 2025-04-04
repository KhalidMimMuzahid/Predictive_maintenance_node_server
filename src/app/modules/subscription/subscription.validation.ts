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
    })
    .optional(),
  standard: z
    .object({
      totalMachine: z.number().refine((val) => val !== undefined, {
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
    })
    .optional(),
});

const serviceProviderCompanySchema = z.object({
  packageType: z.enum(['standard', 'enterprise']),
  totalReservationAllowed: z
    .any()
    .refine((val) => val === 'unlimited' || !isNaN(val), {
      message: 'Required for basic package',
      path: ['totalReservationAllowed'],
    }),
  totalReservationAcceptable: z
    .any()
    .refine((val) => val === 'unlimited' || !isNaN(val), {
      message: 'Required for basic package',
      path: ['totalReservationAcceptable'],
    }),
  totalBranch: z.number(),
  totalVendor: z.number(),
  teamSize: z.number(),
  hasMarketplaceAccess: z.boolean(),
});

// Define the zod schema for package
const packageSchema = z.object({
  packageFor: z.enum(['showaUser', 'serviceProviderCompany']),
  showaUser: showaUserSchema.optional(),
  serviceProviderCompany: serviceProviderCompanySchema.optional(),
  // Uncomment and define serviceProviderCompany schema if needed
  // serviceProviderCompany: z.object({
  //   totalEngineer: z.number(),
  // }).optional(),
});
// Define the zod schema for subscription
const createSubscriptionSchema = z.object({
  subscriptionTitle: z.string(),
  bannerUrl: z.string(),
  package: packageSchema,
  price: priceSchema,
  validity: z.number(),
  features: z.array(z.string()),
});
export const subscriptionValidation = {
  createSubscriptionSchema,
};

import { z } from 'zod';

 const addAdditionalProductValidationSchema = z.object({
   productName: z.string(),
   cost: z.object({
     price: z.number().min(10),
     quantity: z.number().min(1),
     tax: z.number().optional(),
   }),
 });
const inspectionValidationSchema = z.object({
  additionalProducts: z
    .object({
      products: z
        .array(
          z.object({
            productName: z.string(),
            cost: z.object({
              price: z.number().nonnegative(),
              quantity: z.number().int().nonnegative(),
            }),
          }),
        )
        .optional(),
      documents: z
        .array(
          z.object({
            url: z.string().url(),
            fileName: z.string().optional(),
            fileType: z.string(),
          }),
        )
        .optional(),
    })
    .optional(),
  inspection: z
    .object({
      inspectingTime: z.number().nonnegative(),
      serviceFee: z.number().nonnegative(),
      operatorInformation: z
        .object({
          heightOfOperator: z.number().nonnegative(),
          weightOfOperator: z.number().nonnegative(),
          ageOfOperator: z.number().int().nonnegative(),
          genderOfOperator: z.enum(['male', 'female']),
          numberOfOperators: z.number().int().nonnegative(),
          operatingDistance: z.number().nonnegative(),
          workingDurations: z.number().nonnegative(),
        })
        .optional(),
      machineEnvironment: z
        .object({
          temperature: z.number(),
          humidity: z.number().min(0).max(100),
          drainageLiquidTemperature: z.number(),
          steamDrain: z.number(),
          noiseLevel: z.number(),
          runningTimePerDay: z.number().nonnegative(),
          weightOfTheMachine: z.number().nonnegative(),
        })
        .optional(),
      // issues: z.string().optional(),
      observation: z.string().optional(),
    })
    .optional(),
});

const inspectionReport = z.object({
  issues: z.string(),
});
export const invoiceValidation = {
  addAdditionalProductValidationSchema,
  inspectionValidationSchema,
  inspectionReport,
};

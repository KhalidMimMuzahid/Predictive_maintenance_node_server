import { z } from 'zod';
import {
  createAddressValidationSchema,
  //   createCardValidationSchema,
} from '../common/common.validation';

// Define Zod schema
export const ServiceProviderBranchCreateValidationSchema = z.object({
  //   status: z.enum(['pending', 'success', 'blocked']),
  //   type: z.string(),
  branchName: z.string(),
  department: z.string(),
  // serviceProviderCompany: z.string(), // Assuming ObjectId is represented as a string
  email: z.string().email(),
  contactNo: z.string(),
  language: z
    .object({
      katakana: z.object({ branchName: z.string() }).optional(),
      korean: z.object({ branchName: z.string() }).optional(),
    })
    .optional(),
  address: createAddressValidationSchema, // Assuming TAddress is a valid Zod schema
  departmentInCharge: z.string(), // You need to define the validation rules for this property
  personInChargeName: z.string(), // You need to define the validation rules for this property
  //   bank: z.object({
  //     bankName: z.string(),
  //     branchName: z.string(),
  //     accountNo: z.number(), // Assuming account number is numeric
  //     postalCode: z.string(),
  //     address: createAddressValidationSchema, // Assuming TAddress is a valid Zod schema
  //     departmentInCharge: z.string(), // You need to define the validation rules for this property
  //     personInChargeName: z.string(), // You need to define the validation rules for this property
  //     card: createCardValidationSchema, // Assuming TCard is a valid Zod schema
  //   }),
  services: z.array(z.string()).optional(), // Assuming it's an array of strings
});

export const serviceProviderBranchValidation = {
  ServiceProviderBranchCreateValidationSchema,
};

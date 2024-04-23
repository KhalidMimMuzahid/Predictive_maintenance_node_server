import { z } from 'zod';
import {
  createAddressValidationSchema,
  createCardValidationSchema,
} from '../../../common/common.validation';
import { ServiceProviderBranchCreateValidationSchema } from '../../../serviceProviderBranch/serviceProviderBranch.validation';
import { rootUserCreateValidationSchema } from '../../user.validation';

const serviceProviderAdminCreateValidationSchema = z.object({
  name: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
});
// Define the BankSchema
const BankCreateValidationSchema = z.object({
  bankName: z.string(),
  branchName: z.string(),
  accountNo: z.number(),
  postalCode: z.string(),
  address: createAddressValidationSchema,
  departmentInCharge: z.string(),
  personInChargeName: z.string(),
  card: createCardValidationSchema,
});
const serviceProviderCompanyCreateValidationSchema = z.object({
  //   status: z.enum(['pending', 'success', 'blocked']),
  companyName: z.string(),
  photoUrl: z.string().optional(),
  address: createAddressValidationSchema,
  representativeName: z.string(),
  fax: z.string(),
  corporateNo: z.string(),
  phone: z.string(),
  currency: z.enum([
    'us-dollar',
    'japanese-yen',
    'korean-yen',
    'indian-rupee',
    'euro',
    'pound',
  ]),
  capital: z.number().positive(),
  invoiceRegistrationNo: z.string(),
  services: z.array(z.string()),
  bank: BankCreateValidationSchema,
  //   wallet: z.string().optional(), // Adjust the type as needed
  emergencyContact: z.object({
    departmentInCharge: z.string(),
    personInChargeName: z.string(),
    contactNo: z.string(),
    email: z.string().email(),
  }),
  registrationDocument: z.array(
    z.object({
      photoUrl: z.string(),
      title: z.string(),
    }),
  ),
  //   branches: z.array(z.string()).optional(),
});

const userCreateValidationSchema = z.object({
  rootUser: rootUserCreateValidationSchema,
  serviceProviderAdmin: serviceProviderAdminCreateValidationSchema,
  serviceProviderCompany: serviceProviderCompanyCreateValidationSchema,
  serviceProviderBranch: ServiceProviderBranchCreateValidationSchema.optional(),
});

export const serviceProviderAdminValidation = { userCreateValidationSchema };

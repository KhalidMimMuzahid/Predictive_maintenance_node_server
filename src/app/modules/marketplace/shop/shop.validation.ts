import { z } from 'zod';
import { createAddressValidationSchema } from '../../common/common.validation';

const createShopValidationSchema = z.object({
  type: z.string(),
  status: z.enum(['pending', 'success', 'suspended']),
  shopName: z.string(),
  shopRegNo: z.string(),

  address: createAddressValidationSchema,
  phone: z.string(),
  photoUrl: z.string().optional(),
  registrationDocument: z.array(
    z.object({
      photoUrl: z.string(),
      title: z.string(),
    }),
  ),
});

export const shopValidation = {
  createShopValidationSchema,
};

import { z } from 'zod';

export const WalletValidationSchema = z.object({
  stripeCustomerId: z.string().optional(),
});

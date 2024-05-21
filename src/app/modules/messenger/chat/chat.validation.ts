import { z } from 'zod';

export const createPersonalChatValidationSchema = z.object({
  users: z.array(z.string()).length(2),
});

export const chatValidation = {
  createPersonalChatValidationSchema,
  // createGroupChatValidationSchema
};

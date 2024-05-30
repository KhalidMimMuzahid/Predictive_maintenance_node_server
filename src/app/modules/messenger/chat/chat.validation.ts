import { z } from 'zod';

// const createPersonalChatValidationSchema = z.object({
//   users: z.array(z.string()).length(2),
// });
const createGroupChatValidationSchema = z.object({
  users: z.array(z.string()).min(2),
  group: z
    .object({
      groupName: z.string().optional(),
      groupPhotoUrl: z.string().optional(),
    })
    .optional(),
});

export const chatValidation = {
  // createPersonalChatValidationSchema,
  createGroupChatValidationSchema,
};

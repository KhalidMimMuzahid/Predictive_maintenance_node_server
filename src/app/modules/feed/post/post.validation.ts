import { z } from 'zod';

// Schema for TUserPost
const userPostSchema = z.object({
  title: z.string(),
  files: z.array(
    z.object({
      fileUrl: z.string(),
      fileName: z.string(),
      extension: z.string(),
    }),
  ),
});

// Schema for TAdvertisement
const advertisementSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  scheduledDate: z
    .object({
      startDate: z.string(),
      endDate: z.string(),
    })
    .refine(
      (date) => {
        if (date) {
          const { startDate, endDate } = date;
          if (startDate || endDate) {
            try {
              if (startDate && endDate) {
                return (
                  new Date(endDate) > new Date(startDate) &&
                  new Date(endDate) > new Date() &&
                  new Date(startDate) > new Date()
                );
              } else if (startDate) {
                return new Date(startDate) > new Date();
              } else if (!startDate && endDate) {
                return new Date(endDate) > new Date();
              }
            } catch (error) {
              return false;
            }
          } else {
            return true;
          }
        } else {
          return true;
        }
      },

      {
        message:
          'Please follow the rules for setting bid starting and ending date',
        path: ['date'],
      },
    ),
  files: z.array(
    z.object({
      fileUrl: z.string(),
      fileName: z.string(),
      extension: z.string(),
    }),
  ),
});

// Main Schema for TPost
const createPostValidationSchema = z.object({
  location: z.string().optional(),
  viewPrivacy: z.enum(['public', 'friends', 'only-me', 'specific-friends']),
  commentPrivacy: z
    .enum(['public', 'friends', 'only-me', 'specific-friends'])
    .default('public'),

  type: z.enum(['userPost', 'advertisement']),
  userPost: userPostSchema.optional(),
  advertisement: advertisementSchema.optional(),
});
//   .refine(
//     (data) =>
//       (data.type === 'userPost' && data.userPost && !data.advertisement) ||
//       (data.type === 'advertisement' && data.advertisement && !data.userPost),
//     {
//       message:
//         "userPost is required if type is 'userPost' and advertisement is required if type is 'advertisement'",
//     },
//   );
const sharedPostValidationSchema = z.object({
  // location: z.string().optional(),
  viewPrivacy: z.enum(['public', 'friends  ', 'only-me', 'specific-friends']),
  commentPrivacy: z
    .enum(['public', 'friends', 'only-me', 'specific-friends'])
    .default('public'),
});

export const postValidation = {
  createPostValidationSchema,
  sharedPostValidationSchema,
};

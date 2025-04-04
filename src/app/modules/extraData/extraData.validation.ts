import { z } from 'zod';

const addFeedbackValidationSchema = z.object({
  title: z.string(),
  photos: z
    .array(
      z.object({
        photoUrl: z.string().url(),
        title: z.string().optional(),
      }),
    )
    .optional(),
});
const inviteMemberValidationSchema = z.object({
  data: z
    .object({
      type: z.enum([
        'serviceProviderAdmin',
        'showaUser',
        'serviceProviderEngineer',
        'serviceProviderBranchManager',
      ]),
      serviceProviderAdmin: z
        .object({
          email: z.string(),
          phone: z.string(),
          companyName: z.string(),
        })
        .optional(),
      showaUser: z
        .object({
          email: z.string(),
          phone: z.string(),
          name: z.object({ firstName: z.string(), lastName: z.string() }),
        })
        .optional(),
      serviceProviderEngineer: z
        .object({
          serviceProviderCompany: z.string(),
          serviceProviderBranch: z.string(),
          email: z.string(),
          phone: z.string(),
          name: z.object({ firstName: z.string(), lastName: z.string() }),
        })
        .optional(),
      serviceProviderBranchManager: z
        .object({
          serviceProviderCompany: z.string(),
          serviceProviderBranch: z.string(),
          email: z.string(),
          phone: z.string(),
          name: z.object({ firstName: z.string(), lastName: z.string() }),
          photoUrl: z.string(),
          nid: z.object({
            frontPhotoUrl: z.string(),
            backPhotoUrl: z.string(),
          }),
        })
        .optional(),
    })
    .refine(
      (data) => {
        if (data) {
          const { type } = data;

          if (type === 'showaUser' && !data?.showaUser) {
            return false;
          }
          if (type === 'serviceProviderAdmin' && !data?.serviceProviderAdmin) {
            return false;
          }
          if (
            type === 'serviceProviderEngineer' &&
            !data?.serviceProviderEngineer
          ) {
            return false;
          }
          if (
            type === 'serviceProviderBranchManager' &&
            !data?.serviceProviderBranchManager
          ) {
            return false;
          }

          return true;
        } else {
          return false;
        }
      },

      {
        message: 'you must provide data according to the type',
        path: ['type'],
      },
    ),
});

export const extraDataValidation = {
  addFeedbackValidationSchema,
  inviteMemberValidationSchema,
};

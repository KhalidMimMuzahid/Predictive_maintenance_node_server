import { User } from './user.model';

const getUserBy_id = async (_id: string) => {
  const user = await User.findById(_id).populate([
    {
      path: 'showaUser',
      options: { strictPopulate: false },
    },
    {
      path: 'serviceProviderAdmin',
      options: { strictPopulate: false },
    },
  ]);

  return user;
};
export const userServices = {
  getUserBy_id,
};

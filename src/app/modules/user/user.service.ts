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
const getAllShowaCustomersFromDB = async () => {
  const showaCustomers = await User.find({ role: 'showa-user' }).populate([
    {
      path: 'showaUser',
      options: { strictPopulate: false },
    },
  ]);

  return showaCustomers;
};
export const userServices = {
  getUserBy_id,
  getAllShowaCustomersFromDB,
};

import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from './user.model';
import { jwtFunc } from '../../utils/jwtFunction';


// 'showaAdmin'
// 'showaSubAdmin'
// 'serviceProviderAdmin'
// 'serviceProviderSubAdmin'
// 'serviceProviderEngineer'
// 'serviceProviderBranchManager'
// 'serviceProviderSupportStuff'




const signIn = async (uid: string) => {
  const user = await User.findOne({ uid }).populate([
    {
      path: 'showaUser',
      options: { strictPopulate: false },
    },
    {
      path: 'showaAdmin',
      options: { strictPopulate: false },
    },
    {
      path: 'showaSubAdmin',
      options: { strictPopulate: false },
    },
    {
      path: 'serviceProviderAdmin',
      options: { strictPopulate: false },
    },
    {
      path: 'serviceProviderSubAdmin',
      options: { strictPopulate: false },
    },
    {
      path: 'serviceProviderEngineer',
      options: { strictPopulate: false },
    },
    {
      path: 'serviceProviderBranchManager',
      options: { strictPopulate: false },
    },
    {
      path: 'serviceProviderSupportStuff',
      options: { strictPopulate: false },
    },
    // // for no we no need wallet in this api; cause for get wallet we have another api
    // {
    //   path: 'wallet',
    //   options: { strictPopulate: false },
    // },
  ]);
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'no user founded with this uid');
  }
  const token = jwtFunc.generateToken(
    user?.email as string,
    user?._id.toString(),
    user?.uid as string,
    user?.role as string,
  );

  return { user, token };
};
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
  signIn,
  getUserBy_id,
  getAllShowaCustomersFromDB,
};

import { Wallet } from '../../../wallet/wallet.model';
import { TUser } from '../../user.interface';
import { User } from '../../user.model';
import { TShowaUser } from './showaUser.interface';
import { ShowaUser } from './showaUser.model';

const createShowaUserIntoDB = async (
  rootUser: Partial<TUser>,
  showaUser: Partial<TShowaUser>,
) => {
  //create a user object
  // rootUser.role ='showa-user' // we no need to set it ; cause we have already set it as a default value in mongoose model
  // rootUser.isDeleted= false // same as above
  // rootUser.status =  'approved'  // same as above
  const createdUser = await User.create(rootUser);

  const createdWallet = await Wallet.create({
    user: createdUser?._id,
    cards: [],
    balance: 0,
    point: 0,
    showaMB: 0,
  });

  showaUser.user = createdUser?._id;
  // showaUser.isDeleted= false // we no need to set it ; cause we have already set it as a default value in mongoose model
  const createdShowaUser = await ShowaUser.create(showaUser);

  const result = await User.findByIdAndUpdate(
    createdUser?._id,
    {
      wallet: createdWallet?._id,
      showaUser: createdShowaUser?._id,
    },
    { new: true },
  );

  return result;
};

export const showaUserServices = {
  createShowaUserIntoDB,
};

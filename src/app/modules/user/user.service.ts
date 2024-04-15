import { Wallet } from '../wallet/wallet.model';
import { TUser } from './user.interface';
import { User } from './user.model';

const createUserIntoDB = async (payload: Partial<TUser>) => {
  //create a user object
  let userData: Partial<TUser> = {};
  userData = { ...payload };

  const createdUser = await User.create(userData);

  const createdWallet = await Wallet.create({
    user: createdUser?._id,
    cards: [],
    balance: 0,
    point: 0,
    showaMB: 0,
  });

  const result = await User.findByIdAndUpdate(
    createdUser?._id,
    {
      wallet: createdWallet?._id,
    },
    { new: true },
  );

  return result;
};

export const userServices = {
  createUserIntoDB,
};

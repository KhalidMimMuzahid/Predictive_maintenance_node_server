import { Types, mongo } from 'mongoose';
import { Wallet } from './wallet.model';

export const updateWallet = async ({
  wallet,
  balance = 0,
  point = 0,
  showaMB = 0,
  session,
}: {
  wallet: Types.ObjectId;
  balance?: number; // this amount will be added to the wallet
  point?: number; // this amount will be added to the wallet
  showaMB?: number; // this amount will be added to the wallet
  session: mongo.ClientSession;
}) => {
  const walletIncrementObject = {};
  if (balance) {
    walletIncrementObject['balance'] = balance;
  }
  if (point) {
    walletIncrementObject['point'] = point;
  }
  if (showaMB) {
    walletIncrementObject['showaMB'] = showaMB;
  }
  const updatedWallet = await Wallet.findByIdAndUpdate(
    wallet,
    {
      $inc: walletIncrementObject,
    },
    {
      session,
      new: true,
    },
  );

  return updatedWallet ? true : false;
};

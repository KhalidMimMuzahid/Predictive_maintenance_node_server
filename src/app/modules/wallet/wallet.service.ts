import { Types } from 'mongoose';

import { User } from '../user/user.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { Wallet } from './wallet.model';
import { Transaction } from '../transaction/transaction.model';
import { v4 as uuidv4 } from 'uuid';

const addTransfer = async (
  fromId: Types.ObjectId,
  toId: Types.ObjectId,
  amount: number,
) => {
  const fromUser = await User.findById(fromId);
  if (!fromUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no showaUser founded with this id',
    );
  }
  const toUser = await User.findById(toId);
  if (!toUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no showaUser founded with this id',
    );
  }
  const fromWallet = await Wallet.findById(fromUser.wallet);
  const amountFrac = amount / 100;
  fromWallet.balance = fromWallet.balance - amount - amountFrac;
  await fromWallet.save();

  const toWallet = await Wallet.findById(toUser.wallet);
  toWallet.balance = toWallet.balance + amount;
  await toWallet.save();

  const transaction = await Transaction.create({
    category: 'fund-transfer',
    status: 'success',
    paymentMethod: 'showa-balance',
    from: fromId,
    recipient: toId,
    netAmount: amount,
    totalAmount: amount,
    transactionId: uuidv4(),
    // referenceId: fromId
  });
  return transaction;
};

export const walletServices = {
  addTransfer,
};

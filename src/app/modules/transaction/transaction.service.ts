import { Types } from 'mongoose';
import { Transaction } from './transaction.model';

const getRecentTransfers = async (uerId: Types.ObjectId) => {
  const transactions = await Transaction.find({
    from: uerId,
    category: 'fund-transfer',
  }).populate({
    path: 'from',
    populate: { path: 'showaUser', options: { strictPopulate: false } },
  })
  .populate({
    path: 'recipient',
    populate: { path: 'showaUser', options: { strictPopulate: false } },
  });
  return transactions;
};

export const transactionServices = {
  getRecentTransfers,
};

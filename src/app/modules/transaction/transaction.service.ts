import { Types } from 'mongoose';
import { Transaction } from './transaction.model';

const getRecentTransfers = async (uerId: Types.ObjectId) => {
  const transactions = await Transaction.find({
    from: uerId,
    category: 'fund-transfer',
  });
  return transactions;
};

export const transactionServices = {
  getRecentTransfers,
};

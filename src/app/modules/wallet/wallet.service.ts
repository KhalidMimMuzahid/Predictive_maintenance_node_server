import { Types } from 'mongoose';

import httpStatus from 'http-status';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import config from '../../config';
import AppError from '../../errors/AppError';
import { Transaction } from '../transaction/transaction.model';
import { User } from '../user/user.model';
import { TWallet } from './wallet.interface';
import { Wallet } from './wallet.model';

const stripe = new Stripe(config.stripeSecretKey);

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

const fetchCustomerCards = async (userId: Types.ObjectId) => {
  const user = await User.findById(userId).populate('wallet');
  const wallet = user.wallet as TWallet;
  if (!wallet.stripeCustomerId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "showa user doesn't have a stripe customer id",
    );
  }
  const paymentMethods = await stripe.paymentMethods.list({
    customer: wallet.stripeCustomerId,
    type: 'card',
  });
  return paymentMethods.data;
};

const createSetupIntent = async (userId: Types.ObjectId) => {
  const user = await User.findById(userId).populate('wallet');
  const wallet = user.wallet as TWallet;
  if (!wallet.stripeCustomerId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "showa user doesn't have a stripe customer id",
    );
  }
  const setupIntent = await stripe.setupIntents.create({
    payment_method_types: [],
    customer: wallet.stripeCustomerId,
  });
  return { id: setupIntent.id, clientSecret: setupIntent.client_secret };
};

const payWithWallet = async (userId: Types.ObjectId, amount: number) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no showaUser founded with this id',
    );
  }

  const wallet = await Wallet.findById(user.wallet);
  wallet.balance = wallet.balance - amount;
  const updatedWallet = await wallet.save();

  const transaction = await Transaction.create({
    category: 'payment',
    status: 'success',
    paymentMethod: 'showa-balance',
    from: userId,
    // recipient: toId,
    netAmount: amount,
    totalAmount: amount,
    transactionId: uuidv4(),
    referenceId: userId,
  });
  return { cashTransaction: transaction, walletInfo: updatedWallet };
};

const payWithCard = async (
  userId: Types.ObjectId,
  amount: number,
  paymentMethodId: string = '',
  allowFutureUsage: boolean = false,
) => {
  const user = await User.findById(userId).populate('wallet');
  const wallet = user.wallet as TWallet;
  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no showaUser founded with this id',
    );
  }

  const stripeObject: Stripe.PaymentIntentCreateParams = {
    amount: amount,
    currency: 'JPY',
    payment_method_types: ['card'],
    customer: wallet.stripeCustomerId,
    metadata: {
      customerId: user._id.toString(),
    },
    ...(allowFutureUsage && { setup_future_usage: 'off_session' }),
    ...(paymentMethodId && { payment_method: paymentMethodId }),
  };

  const paymentIntent = await stripe.paymentIntents.create(stripeObject);

  const transaction = await Transaction.create({
    category: 'payment',
    status: 'success',
    paymentMethod: 'card',
    from: userId,
    // recipient: toId,
    netAmount: amount,
    totalAmount: amount,
    transactionId: uuidv4(),
    referenceId: userId,
  });
  return {
    clientSecret: paymentIntent['client_secret'],
    cashTransaction: transaction,
  };
};

const createPaymentIntent = async (
  userId: Types.ObjectId,
  amount: number,
  paymentMethodId: string = '',
  allowFutureUsage: boolean = false,
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no showaUser founded with this id',
    );
  }
  const wallet = await Wallet.findById(user.wallet);
  const stripeObject: Stripe.PaymentIntentCreateParams = {
    amount: amount,
    currency: 'JPY',
    payment_method_types: ['card'],
    customer: wallet.stripeCustomerId,
    metadata: {
      customerId: user._id.toString(),
    },
    ...(allowFutureUsage && { setup_future_usage: 'off_session' }),
    ...(paymentMethodId && { payment_method: paymentMethodId }),
  };

  const paymentIntent = await stripe.paymentIntents.create(stripeObject);
  wallet.balance = wallet.balance + amount;
  await wallet.save();

  await Transaction.create({
    category: 'add-fund',
    status: 'success',
    paymentMethod: 'card',
    from: userId,
    // recipient: toId,
    netAmount: amount,
    totalAmount: amount,
    transactionId: uuidv4(),
    referenceId: userId,
  });
  return {
    clientSecret: paymentIntent['client_secret'],
  };
};

const mbTransfer = async (
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
  fromWallet.showaMB = fromWallet.showaMB - amount;
  await fromWallet.save();

  const toWallet = await Wallet.findById(toUser.wallet);
  toWallet.showaMB = toWallet.showaMB + amount;
  await toWallet.save();

  const transaction = await Transaction.create({
    category: 'mb-transfer',
    status: 'success',
    paymentMethod: 'showa-mb',
    from: fromId,
    recipient: toId,
    netAmount: amount,
    totalAmount: amount,
    transactionId: uuidv4(),
    referenceId: fromId,
  });
  return transaction;
};

const getMyMBTransaction = async (userId: Types.ObjectId) => {
  const transactions = await Transaction.find({
    $or: [{ from: userId }, { recipient: userId }, { referenceId: userId }],
    category: 'mb-transfer',
  })
    .populate({
      path: 'from',
      populate: { path: 'showaUser', options: { strictPopulate: false } },
    })
    .populate({
      path: 'recipient',
      populate: { path: 'showaUser', options: { strictPopulate: false } },
    });
  return transactions;
};

const getRecentMBTransfer = async (userId: Types.ObjectId) => {
  const transactions = await Transaction.find({
    from: userId,
    category: 'mb-transfer',
  })
    .populate({
      path: 'from',
      populate: { path: 'showaUser', options: { strictPopulate: false } },
    })
    .populate({
      path: 'recipient',
      populate: { path: 'showaUser', options: { strictPopulate: false } },
    })
    .limit(3);
  return transactions;
};

// const addCardToMyWallet = async ({
//   userId,
//   card,
// }: {
//   userId: Types.ObjectId;
//   card: TCard;
// }) => {
//   const user = await User.findById(userId).populate('wallet');

//   if (!user || !user.wallet) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'User or wallet not found');
//   }

//   const wallet = user.wallet as typeof Wallet.prototype; // Cast to wallet model type
//   //const wallet = user.wallet as TWallet; // Cast to wallet model type

//   // const cardToAdd = {
//   //   card,
//   //   isDeleted: false,
//   // };

//   wallet.cards.push(card);

//   await wallet.save();

//   return wallet;
// };

// const deleteCardFromMyWallet = async ({
//   userId,
//   cardId,
// }: {
//   userId: Types.ObjectId;
//   cardId: string;
// }) => {
//   const user = await User.findById(userId).populate('wallet');

//   if (!user || !user.wallet) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'User or wallet not found');
//   }

//   const wallet = user.wallet as typeof Wallet.prototype; // Cast to wallet model type

//   const cardIndex = wallet.cards.findIndex(
//     (card) => card._id.toString() === cardId,
//   );

//   if (cardIndex === -1) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Card not found in wallet');
//   }

//   wallet.cards.splice(cardIndex, 1);

//   await wallet.save();

//   return wallet;
// };

// const deleteCardFromMyWallet = async ({
//   walletId,
//   cardId,
// }: {
//   walletId: string;
//   cardId: string;
// }) => {
//   await Wallet.findByIdAndUpdate(walletId, {
//     $pull: {
//       cards: {
//         _id: new mongoose.Types.ObjectId(cardId),
//       },
//     },
//   });

//   return;
// };

export const walletServices = {
  addTransfer,
  fetchCustomerCards,
  createSetupIntent,
  payWithWallet,
  payWithCard,
  createPaymentIntent,
  mbTransfer,
  getMyMBTransaction,
  getRecentMBTransfer,
};

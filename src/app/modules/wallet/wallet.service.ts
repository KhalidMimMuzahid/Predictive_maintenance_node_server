import { Types } from 'mongoose';

import httpStatus from 'http-status';
// import Stripe from 'stripe';
// import { v4 as uuidv4 } from 'uuid';
// import config from '../../config';
import AppError from '../../errors/AppError';
import { TCard } from '../common/common.interface';
// import { Transaction } from '../transaction/transaction.model';
// import { User } from '../user/user.model';
// import { TWallet } from './wallet.interface';
import { Wallet } from './wallet.model';

// const stripe = new Stripe(config.stripeSecretKey);



// {
//   const fetchCustomerCards = async (userId: Types.ObjectId) => {
//   const user = await User.findById(userId).populate('wallet');
//   const wallet = user.wallet as TWallet;
//   if (!wallet.stripeCustomerId) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "showa user doesn't have a stripe customer id",
//     );
//   }
//   const paymentMethods = await stripe.paymentMethods.list({
//     customer: wallet.stripeCustomerId,
//     type: 'card',
//   });
//   return paymentMethods.data;
// };
// }

// {
// const createSetupIntent = async (userId: Types.ObjectId) => {
//   const user = await User.findById(userId).populate('wallet');
//   const wallet = user.wallet as TWallet;
//   if (!wallet.stripeCustomerId) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "showa user doesn't have a stripe customer id",
//     );
//   }
//   const setupIntent = await stripe.setupIntents.create({
//     payment_method_types: [],
//     customer: wallet.stripeCustomerId,
//   });
//   return { id: setupIntent.id, clientSecret: setupIntent.client_secret };
// };
// }

// {
// const payWithCard = async (
//   userId: Types.ObjectId,
//   amount: number,
//   paymentMethodId: string = '',
//   allowFutureUsage: boolean = false,
// ) => {
//   const user = await User.findById(userId).populate('wallet');
//   const wallet = user.wallet as TWallet;
//   if (!user) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'no showaUser founded with this id',
//     );
//   }

//   const stripeObject: Stripe.PaymentIntentCreateParams = {
//     amount: amount,
//     currency: 'JPY',
//     payment_method_types: ['card'],
//     customer: wallet.stripeCustomerId,
//     metadata: {
//       customerId: user._id.toString(),
//     },
//     ...(allowFutureUsage && { setup_future_usage: 'off_session' }),
//     ...(paymentMethodId && { payment_method: paymentMethodId }),
//   };

//   const paymentIntent = await stripe.paymentIntents.create(stripeObject);

//   const transaction = await Transaction.create({
//     category: 'payment',
//     status: 'success',
//     paymentMethod: 'card',
//     from: userId,
//     // recipient: toId,
//     netAmount: amount,
//     totalAmount: amount,
//     transactionId: uuidv4(),
//     referenceId: userId,
//   });
//   return {
//     clientSecret: paymentIntent['client_secret'],
//     cashTransaction: transaction,
//   };
// };
// }

// {
// const createPaymentIntent = async (
//   userId: Types.ObjectId,
//   amount: number,
//   paymentMethodId: string = '',
//   allowFutureUsage: boolean = false,
// ) => {
//   const user = await User.findById(userId);
//   if (!user) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'no showaUser founded with this id',
//     );
//   }
//   const wallet = await Wallet.findById(user.wallet);
//   const stripeObject: Stripe.PaymentIntentCreateParams = {
//     amount: amount,
//     currency: 'JPY',
//     payment_method_types: ['card'],
//     customer: wallet.stripeCustomerId,
//     metadata: {
//       customerId: user._id.toString(),
//     },
//     ...(allowFutureUsage && { setup_future_usage: 'off_session' }),
//     ...(paymentMethodId && { payment_method: paymentMethodId }),
//   };

//   const paymentIntent = await stripe.paymentIntents.create(stripeObject);
//   wallet.balance = wallet.balance + amount;
//   await wallet.save();

//   await Transaction.create({
//     category: 'add-fund',
//     status: 'success',
//     paymentMethod: 'card',
//     from: userId,
//     // recipient: toId,
//     netAmount: amount,
//     totalAmount: amount,
//     transactionId: uuidv4(),
//     referenceId: userId,
//   });
//   return {
//     clientSecret: paymentIntent['client_secret'],
//   };
// };
//  }





const addCardToMyWallet = async ({
  userId,
  walletId,
  card,
}: {
  userId: Types.ObjectId;
  walletId: Types.ObjectId;
  card: TCard;
}) => {
  const wallet = await Wallet.findById(walletId);

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, 'Wallet not found');
  }

  if (wallet.user._id.toString() !== userId.toString()) {
    throw new AppError(httpStatus.FORBIDDEN, 'Cannot add card to this wallet');
  }

  wallet.cards.push({ card, isDeleted: false });

  await wallet.save();

  return wallet;
};

const deleteCardFromMyWallet = async ({
  userId,
  walletId,
  cardId,
}: {
  userId: Types.ObjectId;
  walletId: Types.ObjectId;
  cardId: Types.ObjectId;
}) => {
  const updatedWallet = await Wallet.findOneAndUpdate(
    {
      _id: walletId,
      user: userId,
      'cards._id': cardId,
    },
    {
      $pull: { cards: { _id: cardId } },
    },
    { new: true },
  );

  if (!updatedWallet) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Card not found in wallet or you do not have permission to modify this wallet',
    );
  }

  return updatedWallet;
};

const editWallet = async ({
  walletId,
  updateData,
}: {
  walletId: Types.ObjectId;
  updateData: { stripeCustomerId?: string };
}) => {
  const wallet = await Wallet.findOneAndUpdate(
    {
      _id: walletId,
    },
    { $set: updateData },
    { new: true },
  );

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  return wallet;
};

export const walletServices = {
  // fetchCustomerCards,
  // createSetupIntent,
  // payWithWallet,
  // payWithCard,
  // createPaymentIntent,
  addCardToMyWallet,
  deleteCardFromMyWallet,
  editWallet,
};

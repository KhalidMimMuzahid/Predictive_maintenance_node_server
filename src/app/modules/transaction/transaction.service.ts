import Stripe from 'stripe';
import mongoose, { Types } from 'mongoose';
import { Transaction } from './transaction.model';
import { TAddFund, TWalletStatus } from './transaction.interface';
import config from '../../config';
import { Wallet } from '../wallet/wallet.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { updateWallet } from '../wallet/wallet.utils';
import { predefinedValueServices } from '../predefinedValue/predefinedValue.service';
const stripe = new Stripe(config.stripeSecretKey);
const createStripeCheckoutSession = async ({
  user,
  amount,
}: {
  user: Types.ObjectId;
  amount: number;
}) => {
  const addFundData: TAddFund = {
    source: 'card',
    card: {
      stripeSessionId: '',
    },
    amount: amount,
    user: user,
    transactionFee: 0,
  };
  const transaction = await Transaction.create({
    type: 'addFund',
    addFund: addFundData,
    status: 'pending',
  });
  // Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd', // japanese currency
          product_data: {
            name: `adding-fund`, //
          },
          unit_amount: amount * 100, // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `http://localhost:3000/wallet/success?amount=500&name=khalid&age=23&sex=male&address=Mymensingh&married=yes&hasBaby=No&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:3000/wallet/failed?amount=500&name=khalid&age=23&sex=male&address=Mymensingh&married=yes&hasBaby=No`,
  });
  transaction.addFund.card.stripeSessionId = session.id;
  await transaction.save();
  return { url: session.url };
};

const webhookForStripe = async ({
  sig,
  bodyData,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sig: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bodyData: any;
}) => {
  // we must take this value in our .env file
  const endpointSecret =
    'whsec_3230366b25d304594a4af2b572f02e6bb03a80953f7939a21746bc1306828872';

  const event = stripe.webhooks.constructEvent(bodyData, sig!, endpointSecret);
  const sessionForStripe = event.data.object as Stripe.Checkout.Session;
  const transactionData = await Transaction.findOne({
    'addFund.card.stripeSessionId': sessionForStripe.id,
  }).select('addFund');
  const walletData = await Wallet.findOne({
    user: transactionData?.addFund?.user,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatedTransactionData: Record<string, any> = {};
  // Handle the event
  if (event.type === 'checkout.session.async_payment_succeeded') {
    updatedTransactionData['status'] = 'completed';
  } else if (event.type === 'checkout.session.async_payment_failed') {
    updatedTransactionData['status'] = 'failed';
    // console.log(walletData);
  } else if (event.type === 'checkout.session.expired') {
    updatedTransactionData['status'] = 'failed';
    // console.log(walletData);
  }

  // TODO: implement session here
  //  Process the successful payment

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // in percentage
    const transactionFeeRate =
      (await predefinedValueServices.getTransactionFeeForWallet(
        'addFund-card',
      )) as number;
    const transactionFee =
      (transactionData?.addFund?.amount / 100) * transactionFeeRate;
    updatedTransactionData['addFund.transactionFee'] = transactionFee;
    // update wallet data
    const walletStatus: TWalletStatus = {
      previous: {
        balance: walletData?.balance,
        point: walletData?.point,
        showaMB: walletData?.showaMB,
      },
      next: {
        balance:
          walletData?.balance +
          transactionData?.addFund?.amount -
          transactionFee,
        point: walletData?.point,
        showaMB: walletData?.showaMB,
      },
    };
    updatedTransactionData['addFund.card.walletStatus'] = walletStatus;
    const updatedTransaction = await Transaction.findOneAndUpdate(
      {
        'addFund.card.stripeSessionId': session.id,
      },
      updatedTransactionData,
      {
        session,
      },
    );
    if (event.type === 'checkout.session.async_payment_succeeded') {
      if (updatedTransaction) {
        // const updatedWalletData = await walletData.save({ session });
        const updatedWalletData = await updateWallet({
          wallet: walletData?._id,
          balance: transactionData?.addFund?.amount - transactionFee,
          session: session,
        });

        if (updatedWalletData) {
          await session.commitTransaction();
          await session.endSession();
          // we should send mail to user email
          return null;
        } else {
          await session.abortTransaction();
          await session.endSession();
          throw new AppError(
            httpStatus.BAD_REQUEST,
            'something went wrong, please try again',
          );
        }
      } else {
        await session.abortTransaction();
        await session.endSession();
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'something went wrong, please try again',
        );
      }
    } else {
      await session.commitTransaction();
      await session.endSession();
    }
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    // throw error;
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'something went wrong, please try again',
    );
  }
};

const walletInterchangePointToBalance = async ({
  user,
  point,
}: {
  user: Types.ObjectId;
  point: number;
}) => {
  //
  console.log({
    user,
    point,
  });
};

const fundTransferBalanceSend = async ({
  sender,
  receiver,
  balance,
}: {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  balance: number;
}) => {
  console.log({
    sender,
    receiver,
    balance,
  });
};
const fundTransferShowaMBSend = async ({
  sender,
  receiver,
  showaMB,
}: {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  showaMB: number;
}) => {
  console.log({
    sender,
    receiver,
    showaMB,
  });
};
export const transactionServices = {
  createStripeCheckoutSession,
  webhookForStripe,
  walletInterchangePointToBalance,
  fundTransferBalanceSend,
  fundTransferShowaMBSend,
};

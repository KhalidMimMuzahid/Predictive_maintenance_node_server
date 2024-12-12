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
import PredefinedValue from '../predefinedValue/predefinedValue.model';
const stripe = new Stripe(config.stripeSecretKey);
const createStripeCheckoutSession = async ({
  user,
  amount,
}: {
  user: Types.ObjectId;
  amount: number;
}) => {
  const transactionFeeRate =
    ((await predefinedValueServices.getTransactionFeeForWallet(
      'addFund-card',
    )) as number) || 0;
  const transactionFee = (amount / 100) * transactionFeeRate;
  const addFundData: TAddFund = {
    source: 'card',
    card: {
      stripeSessionId: '',
    },
    amount: amount,
    user: user,
    transactionFee: transactionFee,
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
  const endpointSecret = 'whsec_2TQTCg5cfNXIAsXggHIlqqWhQga5DZFU';
  // 'whsec_3230366b25d304594a4af2b572f02e6bb03a80953f7939a21746bc1306828872';

  if (!sig) {
    throw new AppError(httpStatus.BAD_REQUEST, 'signature has missing');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;
  try {
    // Verify the event using the raw body and the signature
    event = stripe.webhooks.constructEvent(bodyData, sig, endpointSecret);
  } catch (err) {
    err.bodyData = bodyData;
    err.sig = sig;
    err.message = `Error of f__k:${err.message}`;
    throw err;
    // throw new AppError(
    //   httpStatus.BAD_REQUEST,
    //   `Error of f__k:${err.message}`,
    // );
  }

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
  //
  if (
    event.type === 'checkout.session.async_payment_succeeded' ||
    event.type === 'checkout.session.completed'
  ) {
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

    const transactionFee = transactionData?.addFund?.transactionFee;
    updatedTransactionData['addFund.transactionFee'] = transactionFee;
    if (
      event.type === 'checkout.session.async_payment_succeeded' ||
      event.type === 'checkout.session.completed'
    ) {
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
    }

    const updatedTransaction = await Transaction.findOneAndUpdate(
      {
        'addFund.card.stripeSessionId': sessionForStripe.id,
      },
      updatedTransactionData,
      {
        session,
      },
    );
    if (
      event.type === 'checkout.session.async_payment_succeeded' ||
      event.type === 'checkout.session.completed'
    ) {
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
            'something went wrong, please try again1',
          );
        }
      } else {
        await session.abortTransaction();
        await session.endSession();
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'something went wrong, please try again2',
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
      'something went wrong, please try again3',
    );
  }
};

const walletInterchangePointToBalance = async ({
  user,
  point: interchangingPoint,
}: {
  user: Types.ObjectId;
  point: number;
}) => {
  const wallet = await Wallet.findOne({ user: user }).select(
    'balance point showaMB',
  );

  const predefinedValue = await PredefinedValue.findOne(
    {
      type: 'wallet',
    },
    {
      'wallet.walletInterchange.pointToBalance.transactionFee': 1,
    },
  );

  if (interchangingPoint > wallet?.point) {
    throw new AppError(httpStatus.BAD_REQUEST, 'you have not enough points');
  }

  const pointToBalanceRate = 1 / 100; // cause 1 balance = 100 points
  const balanceToBeAddedBeforeApplyingTransactionFee =
    interchangingPoint * pointToBalanceRate;
  // transactionFee in percentage
  const transactionFeeRate =
    predefinedValue?.wallet?.walletInterchange?.pointToBalance
      ?.transactionFee || 0;
  const transactionFee =
    balanceToBeAddedBeforeApplyingTransactionFee * (transactionFeeRate / 100);

  const balanceToBeAddedAfterApplyingTransactionFee =
    balanceToBeAddedBeforeApplyingTransactionFee - transactionFee;

  if (
    transactionFee >
    balanceToBeAddedAfterApplyingTransactionFee + wallet?.balance
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'you have not enough balance as transaction fee',
    );
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const isUpdated = await updateWallet({
      wallet: wallet?._id,
      balance: balanceToBeAddedAfterApplyingTransactionFee,
      point: -interchangingPoint, // deducted from wallet
      // showaMB:0,
      session,
    });
    if (isUpdated) {
      const createdTransactionArray = await Transaction.create(
        [
          {
            type: 'walletInterchange',
            walletInterchange: {
              type: 'pointToBalance',
              user: user,
              walletStatus: {
                previous: {
                  balance: wallet?.balance,
                  point: wallet?.point,
                  showaMB: wallet?.showaMB,
                },
                next: {
                  balance:
                    wallet?.balance +
                    balanceToBeAddedAfterApplyingTransactionFee,
                  point: wallet?.point - interchangingPoint,
                  showaMB: wallet?.showaMB,
                },
              },
              pointToBalance: {
                point: interchangingPoint,
                balance: balanceToBeAddedBeforeApplyingTransactionFee,
                transactionFee: transactionFee,
              },
            },
            status: 'completed',
          },
        ],

        { session },
      );
      const createdTransaction = createdTransactionArray[0];
      if (!createdTransaction) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'something went wrong, please try again',
        );
      }
      await session.commitTransaction();
      await session.endSession();
      return null;
    } else {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const fundTransferBalanceSend = async ({
  sender,
  receiver,
  balance: sendingBalance,
}: {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  balance: number;
}) => {
  const senderWallet = await Wallet.findOne({ user: sender }).select(
    'balance point showaMB',
  );
  const receiverWallet = await Wallet.findOne({ user: receiver }).select(
    'balance point showaMB',
  );

  const predefinedValue = await PredefinedValue.findOne(
    {
      type: 'wallet',
    },
    {
      'wallet.fundTransfer.transactionFee': 1,
    },
  );

  // transactionFee in percentage
  const transactionFeeRate =
    predefinedValue?.wallet?.fundTransfer?.transactionFee || 0;
  const transactionFee = sendingBalance * (transactionFeeRate / 100);
  if (sendingBalance + transactionFee > senderWallet?.balance) {
    throw new AppError(httpStatus.BAD_REQUEST, 'you have not enough balance');
  }
  // const balanceToBeAddedAfterApplyingTransactionFee =
  //   sendingBalance - transactionFee;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const isUpdatedForSender = await updateWallet({
      wallet: senderWallet?._id,
      balance: -(sendingBalance + transactionFee),
      // point: 0,
      // showaMB:0,
      session,
    });
    if (!isUpdatedForSender) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }
    const isUpdatedForReceiver = await updateWallet({
      wallet: receiverWallet?._id,
      balance: sendingBalance,
      // point: 0,
      // showaMB:0,
      session,
    });
    if (!isUpdatedForReceiver) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }
    const createdTransactionArray = await Transaction.create(
      [
        {
          type: 'fundTransfer',
          fundTransfer: {
            requestType: 'send',
            fundType: 'balance',
            sender: {
              user: sender,
              walletStatus: {
                previous: {
                  balance: senderWallet?.balance,
                  point: senderWallet?.point,
                  showaMB: senderWallet?.showaMB,
                },
                next: {
                  balance:
                    senderWallet?.balance - (sendingBalance + transactionFee),
                  point: senderWallet?.point,
                  showaMB: senderWallet?.showaMB,
                },
              },
            },
            receiver: {
              user: receiver,
              walletStatus: {
                previous: {
                  balance: receiverWallet?.balance,
                  point: receiverWallet?.point,
                  showaMB: receiverWallet?.showaMB,
                },
                next: {
                  balance: receiverWallet?.balance + sendingBalance,
                  point: receiverWallet?.point,
                  showaMB: receiverWallet?.showaMB,
                },
              },
            },
            amount: sendingBalance,
            transactionFee: transactionFee,
          },
          status: 'completed',
        },
      ],
      { session },
    );
    const createdTransaction = createdTransactionArray[0];
    if (!createdTransaction) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }
    await session.commitTransaction();
    await session.endSession();
    return null;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};
const fundTransferShowaMBSend = async ({
  sender,
  receiver,
  showaMB: sendingShowaMB,
}: {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  showaMB: number;
}) => {
  const senderWallet = await Wallet.findOne({ user: sender }).select(
    'balance point showaMB',
  );
  const receiverWallet = await Wallet.findOne({ user: receiver }).select(
    'balance point showaMB',
  );

  const predefinedValue = await PredefinedValue.findOne(
    {
      type: 'wallet',
    },
    {
      'wallet.fundTransfer.transactionFee': 1,
    },
  );

  if (sendingShowaMB > senderWallet?.showaMB) {
    throw new AppError(httpStatus.BAD_REQUEST, 'you have not enough showaMB');
  }

  // transactionFee in percentage
  const equivalentBalanceFromShowaMB = sendingShowaMB * 100; // if 1 showaMB is equivalent to 100 yen
  const transactionFeeRate =
    predefinedValue?.wallet?.fundTransfer?.transactionFee || 0;
  const transactionFee =
    equivalentBalanceFromShowaMB * (transactionFeeRate / 100);

  if (transactionFee > senderWallet?.balance) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'you have not enough balance to send showaMB as transaction fee',
    );
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const isUpdatedForSender = await updateWallet({
      wallet: senderWallet?._id,
      balance: -transactionFee,
      // point: 0,
      showaMB: -sendingShowaMB,
      session,
    });
    if (!isUpdatedForSender) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }
    const isUpdatedForReceiver = await updateWallet({
      wallet: receiverWallet?._id,
      // balance:0,
      // point: 0,
      showaMB: sendingShowaMB,
      session,
    });
    if (!isUpdatedForReceiver) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }
    const createdTransactionArray = await Transaction.create(
      [
        {
          type: 'fundTransfer',
          fundTransfer: {
            requestType: 'send',
            fundType: 'showaMB',
            sender: {
              user: sender,
              walletStatus: {
                previous: {
                  balance: senderWallet?.balance,
                  point: senderWallet?.point,
                  showaMB: senderWallet?.showaMB,
                },
                next: {
                  balance: senderWallet?.balance - transactionFee,
                  point: senderWallet?.point,
                  showaMB: senderWallet?.showaMB - sendingShowaMB,
                },
              },
            },
            receiver: {
              user: receiver,
              walletStatus: {
                previous: {
                  balance: receiverWallet?.balance,
                  point: receiverWallet?.point,
                  showaMB: receiverWallet?.showaMB,
                },
                next: {
                  balance: receiverWallet?.balance,
                  point: receiverWallet?.point,
                  showaMB: receiverWallet?.showaMB + sendingShowaMB,
                },
              },
            },
            amount: sendingShowaMB,
            transactionFee: transactionFee,
          },
          status: 'completed',
        },
      ],
      { session },
    );
    const createdTransaction = createdTransactionArray[0];
    if (!createdTransaction) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }
    await session.commitTransaction();
    await session.endSession();
    return null;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const fundTransferBalanceReceive = async ({
  balance,
  sender,
  receiver,
}: {
  balance: number;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
}) => {
  const predefinedValue = await PredefinedValue.findOne(
    {
      type: 'wallet',
    },
    {
      'wallet.fundTransfer.transactionFee': 1,
    },
  );
  // transactionFee in percentage
  const transactionFeeRate =
    predefinedValue?.wallet?.fundTransfer?.transactionFee || 0;
  const transactionFee = balance * (transactionFeeRate / 100);

  const createdTransaction = await Transaction.create({
    type: 'fundTransfer',
    fundTransfer: {
      requestType: 'receive',
      fundType: 'balance',
      sender: {
        user: sender,
        walletStatus: {},
      },
      receiver: {
        user: receiver,
        walletStatus: {},
      },
      amount: balance,
      transactionFee: transactionFee,
    },
    status: 'pending',
  });

  if (!createdTransaction) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'something we wrong, please try again',
    );
  }
  return true;
};

const updateFundTransferBalanceReceiveStatus = async ({
  transaction,
  sender,
  status,
}: {
  transaction: Types.ObjectId;
  sender: Types.ObjectId;
  status: 'completed' | 'failed';
}) => {
  const transactionData = await Transaction.findOne({
    _id: transaction,
    type: 'fundTransfer',
    status: 'pending',
    'fundTransfer.requestType': 'receive',
    'fundTransfer.fundType': 'balance',
    'fundTransfer.sender.user': sender,
  });

  if (status === 'failed') {
    transactionData.status = 'failed';
    const updatedTransactionData = await transactionData.save();
    if (!updatedTransactionData) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }
    return null;
  }
  // for status = 'completed'
  const senderData = transactionData?.fundTransfer?.sender;
  const receiverData = transactionData?.fundTransfer?.receiver;

  const senderWallet = await Wallet.findOne({ user: senderData?.user }).select(
    'balance point showaMB',
  );
  const receiverWallet = await Wallet.findOne({
    user: receiverData?.user,
  }).select('balance point showaMB');
  const sendingAmount = transactionData?.fundTransfer?.amount;
  const transactionFee = transactionData?.fundTransfer?.transactionFee;
  if (sendingAmount + transactionFee > senderWallet?.balance) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'you have not enough balance to transfer',
    );
  }
  // accepting transactions by  donor
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const isUpdatedForSender = await updateWallet({
      wallet: senderWallet?._id,
      balance: -(sendingAmount + transactionFee),
      // point: 0,
      // showaMB:0,
      session,
    });
    if (!isUpdatedForSender) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }
    const isUpdatedForReceiver = await updateWallet({
      wallet: receiverWallet?._id,
      balance: sendingAmount,
      // point: 0,
      // showaMB:0,
      session,
    });
    if (!isUpdatedForReceiver) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }

    const walletStatusForSender = {
      previous: {
        balance: senderWallet?.balance,
        point: senderWallet?.point,
        showaMB: senderWallet?.showaMB,
      },
      next: {
        balance: senderWallet?.balance - (sendingAmount + transactionFee),
        point: senderWallet?.point,
        showaMB: senderWallet?.showaMB,
      },
    };

    const walletStatusForReceiver = {
      previous: {
        balance: receiverWallet?.balance,
        point: receiverWallet?.point,
        showaMB: receiverWallet?.showaMB,
      },
      next: {
        balance: receiverWallet?.balance + sendingAmount,
        point: receiverWallet?.point,
        showaMB: receiverWallet?.showaMB,
      },
    };
    transactionData.fundTransfer.sender.walletStatus = walletStatusForSender;
    transactionData.fundTransfer.receiver.walletStatus =
      walletStatusForReceiver;
    transactionData.status = 'completed';
    const updatedTransactionData = await transactionData.save({ session });
    if (!updatedTransactionData) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'something went wrong, please try again',
      );
    }
    await session.commitTransaction();
    await session.endSession();
    return null;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const getMyAllFundTransferRequests = async ({
  user,
  requestType,
}: {
  user: Types.ObjectId;
  requestType: 'sent' | 'received';
}) => {
  if (requestType === 'received') {
    // const transactions = await Transaction.find({
    //   type: 'fundTransfer',
    //   'fundTransfer.requestType': 'receive',
    //   'fundTransfer.fundType': 'balance',
    //   'fundTransfer.sender.user': user,
    // });
    const transactions = await Transaction.aggregate([
      {
        $match: {
          type: 'fundTransfer',
          'fundTransfer.requestType': 'receive',
          'fundTransfer.fundType': 'balance',
          'fundTransfer.sender.user': user,
        },
        // $lookup: {
        //   from: 'user', // Name of the showaUser collection
        //   localField: 'fundTransfer.receiver.user',
        //   foreignField: '_id',
        //   as: 'fundTransfer.receiver.user',
        // },
      },
    ]);
    return transactions;
  } else if (requestType === 'sent') {
    const transactions = await Transaction.aggregate([
      {
        $match: {
          type: 'fundTransfer',
          'fundTransfer.requestType': 'receive',
          'fundTransfer.fundType': 'balance',
          'fundTransfer.receiver.user': user,
        },
      },
      // {
      //   $lookup: {
      //     from: 'users', // Name of the showaUser collection
      //     localField: 'fundTransfer.receiver.user',
      //     foreignField: '_id',
      //     as: 'fundTransfer.receiver.user',
      //   },
      // },
    ]);
    return transactions;
  }
};
export const transactionServices = {
  createStripeCheckoutSession,
  webhookForStripe,
  walletInterchangePointToBalance,
  fundTransferBalanceSend,
  fundTransferShowaMBSend,
  fundTransferBalanceReceive,
  updateFundTransferBalanceReceiveStatus,
  getMyAllFundTransferRequests,
};
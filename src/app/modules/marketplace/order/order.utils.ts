import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../../errors/AppError';
import { TAuth } from '../../../interface/error';
import { padNumberWithZeros } from '../../../utils/padNumberWithZeros';
import Product from '../product/product.model';
import { TOrder, TPaymentType } from './order.interface';
import Order from './order.model';
import { Wallet } from '../../wallet/wallet.model';
import { updateWallet } from '../../wallet/wallet.utils';

export const orderProducts = async ({
  auth,
  quantity,
  product,
  paymentType,
  lastOrderId,
  session,
}: {
  auth: TAuth;
  quantity: number;
  product: string;
  paymentType: TPaymentType;
  lastOrderId: number;
  session: mongoose.mongo.ClientSession;
}) => {
  const productData = await Product.findById(product).select(
    'salePrice stockManagement shop ownedBy shop ownedBy',
  );

  if (!productData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'product you provided is not found',
    );
  }

  // we should also check the available stocks of this product here and the quantity can not be grater than available stocks
  if (quantity > productData?.stockManagement?.availableStock || quantity < 1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'quantity must be positive number and greater than available stock',
    );
  }
  const order: Partial<TOrder> = {};

  order.orderId = padNumberWithZeros(lastOrderId, 6);
  const transferFee: number = 0;
  order.user = auth?._id;
  if (productData?.shop) {
    order.shop = productData?.shop;
  }
  order.product = productData?._id;
  order.status = 'pending';
  order.pending = {
    isActivated: true,
  };
  order.paymentType = paymentType;
  order.cost = {
    price: productData?.salePrice,
    quantity: quantity,
    transferFee: transferFee,
    totalAmount: productData?.salePrice * quantity + transferFee,
  };
  order.paidStatus = {
    isPaid: true,
  };

  // transaction

  //   try {
  // session.startTransaction();
  const createdOrderArray = await Order.create([order], { session });

  if (!createdOrderArray?.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Something went wrong creating order, please try again',
    );
  }

  const createdOrder = createdOrderArray[0];

  if (productData?.ownedBy === 'serviceProviderCompany' && productData?.shop) {
    const walletData = await Wallet.findOne({ shop: productData?.shop }).select(
      'balance point showaMB',
    );
    const updatedWallet = await updateWallet({
      session: session,
      wallet: walletData?._id,
      balance: productData?.salePrice * quantity,
    });
    if (!updatedWallet) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Something went wrong, please try again',
      );
    }
  } else if (productData?.ownedBy === 'showa') {
    //  do i for showa products (posted by showa )
  }
  // add amount to shop wallet

  productData.stockManagement.availableStock -= quantity;
  productData.stockManagement.soldCount = productData.stockManagement.soldCount
    ? productData.stockManagement.soldCount + quantity
    : quantity;
  const updatedProduct = await productData.save({ session });

  if (!updatedProduct) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Something went wrong creating order, please try again',
    );
  }

  // await session.commitTransaction();
  // await session.endSession();
  return createdOrder;
  //   } catch (error) {
  //     await session.abortTransaction();
  //     await session.endSession();
  //     throw error;
  //   }
};

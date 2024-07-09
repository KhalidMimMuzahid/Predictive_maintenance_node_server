import mongoose from 'mongoose';
import { TAuth } from '../../../interface/error';
import { TCart } from './cart.interface';
import Cart from './cart.model';
import Product from '../product/product.model';
import AppError from '../../../errors/AppError';
import httpStatus from 'http-status';

const addProductToCart = async ({
  auth,
  quantity,
  product,
}: {
  auth: TAuth;
  quantity: number;
  product: string;
}) => {
  //

  const productData = await Product.findById(product);
  // we should also check the available stocks of this product here and the quantity can not be grater than available stocks
  if (!productData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'product you provided is not found',
    );
  }
  const cart: Partial<TCart> = {
    user: auth?._id,
    quantity,
    product: new mongoose.Types.ObjectId(product),
  };

  const result = await Cart.create(cart);

  return result;
};

export const cartServices = {
  addProductToCart,
};

import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { TAuth } from '../../../interface/error';
import { padNumberWithZeros } from '../../../utils/padNumberWithZeros';
import { TProduct } from './product.interface';
import Product from './product.model';
import Shop from '../shop/shop.model';

const createProduct = async ({
  auth,
  product,
}: {
  auth: TAuth;
  product: Partial<TProduct>;
}) => {
  const lastProduct = await Product.findOne({}, { productId: 1 }).sort({
    _id: -1,
  });

  product.productId = padNumberWithZeros(
    Number(lastProduct?.productId || '000000') + 1,
    6,
  );
  product.addedBy = auth?._id;

  if (auth?.role === 'showaAdmin') {
    product.ownedBy = 'showa';
  } else if (auth?.role === 'serviceProviderAdmin') {
    product.ownedBy = 'serviceProviderCompany';

    const shop = await Shop.findOne({ serviceProviderAdmin: auth?._id });
    // product.shop
    if (!shop) {
      throw new AppError(httpStatus.BAD_REQUEST, 'you have no shop yet');
    }
    product.shop = shop?._id;
  }
  const result = await Product.create(product);
  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'product could not be created, please try again',
    );
  }
  return result;
};

export const productServices = {
  createProduct,
};

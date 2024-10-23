import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../../errors/AppError';
import { TAuth } from '../../../interface/error';
import { padNumberWithZeros } from '../../../utils/padNumberWithZeros';
import PredefinedValue from '../../predefinedValue/predefinedValue.model';
import Order from '../order/order.model';
import Shop from '../shop/shop.model';
import {
  TProduct,
  TProductFilter,
  TReviewObject,
  TSortType,
  TSortedBy,
} from './product.interface';
import Product from './product.model';

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

  const predefinedValue = await PredefinedValue.findOne(
    {
      type: 'marketplace',
      'marketplace.type': 'product',
    },
    { 'marketplace.product.categories': 1 },
  );
  const category = predefinedValue?.marketplace?.product?.categories?.find(
    (each) => each?.category === product?.category,
  );

  if (!category) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'product category must be available in category list',
    );
  }

  const isSubCategoryAvailable = category?.subCategories?.some(
    (each) => each === product?.subCategory,
  );
  if (!isSubCategoryAvailable) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'sub category must be available in category list',
    );
  }
  product.productId = padNumberWithZeros(
    Number(lastProduct?.productId || '000000') + 1,
    6,
  );
  product.addedBy = auth?._id;
  product.stockManagement.soldCount = 0;
  if (auth?.role === 'showaAdmin') {
    product.ownedBy = 'showa';
    const shop = await Shop.findOne({ ownedBy: 'showa' });
    // product.shop
    if (!shop) {
      const newShop = await Shop.create({
        ownedBy: 'showa',
        type: 'all',
        status: 'success',
        shopName: 'Showa',
      });
      if (!newShop) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Something went wrong, please try again',
        );
      }
      product.shop = newShop?._id;
    } else {
      product.shop = shop?._id;
    }
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
const editProduct = async ({
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  auth,
  product,
  productData,
}: {
  auth: TAuth;
  product: string;
  productData: Partial<TProduct>;
}) => {
  const predefinedValue = await PredefinedValue.findOne(
    {
      type: 'marketplace',
      'marketplace.type': 'product',
    },
    { 'marketplace.product.categories': 1 },
  );
  const category = predefinedValue?.marketplace?.product?.categories?.find(
    (each) => each?.category === productData?.category,
  );

  if (!category) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'product category must be available in category list',
    );
  }

  const isSubCategoryAvailable = category?.subCategories?.some(
    (each) => each === productData?.subCategory,
  );
  if (!isSubCategoryAvailable) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'sub category must be available in category list',
    );
  }

  const existingProduct = await Product.findById(product);
  if (!existingProduct) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'product has not found with the provided ID',
    );
  }

  existingProduct.stockManagement.soldCount =
    existingProduct?.stockManagement?.soldCount || 0;

  if (productData?.name) {
    existingProduct.name = productData?.name;
  }
  if (productData?.details) {
    existingProduct.details = productData?.details;
  }
  if (productData?.category) {
    existingProduct.category = productData?.category;
  }
  if (productData?.subCategory) {
    existingProduct.subCategory = productData?.subCategory;
  }
  if (productData?.regularPrice) {
    existingProduct.regularPrice = productData?.regularPrice;
  }
  if (productData?.salePrice) {
    existingProduct.salePrice = productData?.salePrice;
  }
  if (productData?.taxStatus) {
    existingProduct.taxStatus = productData?.taxStatus;
  }
  if (productData?.taxRate) {
    existingProduct.taxRate = productData?.taxRate;
  }
  if (productData?.packageSize) {
    const packageSize = productData?.packageSize;
    if (packageSize?.height) {
      existingProduct.packageSize.height = packageSize?.height;
    }
    if (packageSize?.weight) {
      existingProduct.packageSize.weight = packageSize?.weight;
    }
    if (packageSize?.width) {
      existingProduct.packageSize.width = packageSize?.width;
    }
    if (packageSize?.length) {
      existingProduct.packageSize.length = packageSize?.length;
    }
  }
  if (productData?.stockManagement) {
    const stockManagement = productData?.stockManagement;
    if (stockManagement?.availableStock) {
      existingProduct.stockManagement.availableStock =
        stockManagement?.availableStock;
    }
    if (stockManagement?.trackStockQuantity) {
      existingProduct.stockManagement.trackStockQuantity =
        stockManagement?.trackStockQuantity;
    }
  }

  if (productData?.photos) {
    existingProduct.photos = productData?.photos;
  }
  const updatedProduct = await existingProduct?.save();

  if (!updatedProduct) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'something went wrong, please try again',
    );
  }
  return updatedProduct;
};
const addReview = async ({
  reviewObject,
  user,
  product,
}: {
  reviewObject: TReviewObject;
  user: mongoose.Types.ObjectId;
  product: string;
}) => {
  const updatedProduct = await Product.findByIdAndUpdate(product, {
    $push: {
      'feedback.reviews': {
        review: reviewObject?.review,
        rate: reviewObject?.rate,
        user,
      },
    },
    // 'feedback.reviews': 5,
  });

  return updatedProduct;
};
const getAllProducts = async (filterQuery: Partial<TProductFilter>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterQueries: any[] = [];

  if (filterQuery?.productName) {
    filterQueries.push({
      name: { $regex: filterQuery?.productName, $options: 'i' },
    });
  }
  if (filterQuery?.brandName) {
    filterQueries.push({ brand: filterQuery?.brandName });
  }
  if (filterQuery?.modelName) {
    filterQueries.push({ model: filterQuery?.modelName });
  }
  if (filterQuery?.category) {
    filterQueries.push({ category: filterQuery?.category });
  }
  if (filterQuery?.subCategory) {
    filterQueries.push({ subCategory: filterQuery?.subCategory });
  }

  if (filterQuery?.maxPrice || filterQuery?.minPrice) {
    const priceRange = {
      $and: [],
    };

    if (filterQuery?.maxPrice) {
      priceRange.$and.push({
        salePrice: { $lte: Number(filterQuery?.maxPrice) },
      });
    }
    if (filterQuery?.minPrice) {
      priceRange.$and.push({
        salePrice: { $gte: Number(filterQuery?.minPrice) },
      });
    }
    filterQueries.push(priceRange);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = {};
  if (filterQueries?.length) {
    query = {
      $and: filterQueries,
    };
  }
  const products = await Product.find(query);
  return products;
};

const getAllProductsCategoryWise = async () => {
  //
  const products = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        totalProducts: { $sum: 1 },
      },
    },
  ]);

  return products;
};
const getAllProductsByShopDashboard = async ({ shop }: { shop: string }) => {
  const productsCount = await Product.countDocuments({
    shop: new mongoose.Types.ObjectId(shop),
  });
  const lowStockProductCOunt = await Product.countDocuments({
    shop: new mongoose.Types.ObjectId(shop),
    'stockManagement.availableStock': {
      $lte: 5,
    },
  });
  const packageData = 'Silver';
  return { productsCount, lowStockProductCOunt, packageData };
};

const getAllProductsByShop = async ({
  shop,
  sortedBy,
  sortType,
}: {
  shop: string;
  sortedBy: TSortedBy;
  sortType: TSortType;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any;
  if (sortedBy === 'time') {
    result = await Product.find(
      {
        shop: new mongoose.Types.ObjectId(shop),
      },
      {},
      { _id: sortType === 'asc' ? 1 : -1 },
    );
  } else if (sortedBy === 'price') {
    result = await Product.find(
      {
        shop: new mongoose.Types.ObjectId(shop),
      },
      {},
      { salePrice: sortType === 'asc' ? 1 : -1 },
    );
  } else if (sortedBy === 'top-sold') {
    result = await Product.find(
      {
        shop: new mongoose.Types.ObjectId(shop),
      },
      {},
      { soldCount: sortType === 'asc' ? 1 : -1 },
    );
  } else if (sortedBy === 'low-stock') {
    result = await Product.find(
      {
        shop: new mongoose.Types.ObjectId(shop),
        'stockManagement.availableStock': {
          $lte: 5,
        },
      },
      {},
      { 'stockManagement.availableStock': sortType === 'asc' ? 1 : -1 },
    );
  }

  return result;
};
const getProductByProduct_id = async (productId: string) => {
  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Product not found with the given ID',
    );
  }

  return product;
};

const getTopSalesProducts = async () => {
  const today = new Date();

  // Define date range for the last 30 days
  const last30DaysAgo = new Date(today);
  last30DaysAgo.setDate(today.getDate() - 30);

  const secondLast30DaysAgo = new Date(last30DaysAgo);
  secondLast30DaysAgo.setDate(last30DaysAgo.getDate() - 30);

  // Aggregation for last 30 days
  const last30DaysResults = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: last30DaysAgo, $lte: today },
        'paidStatus.isPaid': true,
      },
    },
    {
      $unwind: '$product',
    },
    {
      $group: {
        _id: '$product',
        totalQuantity: { $sum: '$cost.quantity' },
        totalRevenue: { $sum: '$cost.totalAmount' },
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    {
      $unwind: '$product',
    },
    {
      $project: {
        _id: 1,
        totalQuantity: 1,
        totalRevenue: 1,
        'product.name': 1,
        'product.regularPrice': 1,
        'product.salePrice': 1,
        'product.photos': { $arrayElemAt: ['$product.photos', 0] },
      },
    },
    {
      $match: { totalQuantity: { $ne: 0 } },
    },
    {
      $sort: { totalQuantity: -1 },
    },
    {
      $limit: 4,
    },
  ]);

  const secondLast30DaysResults = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: secondLast30DaysAgo, $lte: last30DaysAgo },
        'paidStatus.isPaid': true,
      },
    },
    {
      $unwind: '$product',
    },
    {
      $group: {
        _id: '$product',
        totalQuantity: { $sum: '$cost.quantity' },
        totalRevenue: { $sum: '$cost.totalAmount' },
      },
    },
  ]);

  const calculatePercentageProgress = (
    last30DaysValue: number,
    secondLast30DaysValue: number,
  ): number => {
    if (secondLast30DaysValue === 0) {
      return last30DaysValue > 0 ? 100 : 0; // If no previous data, assume either 100% increase or no change.
    }
    return ((last30DaysValue - secondLast30DaysValue) / last30DaysValue) * 100;
  };

  // Map the products from both periods and calculate progress
  const topProductsWithProgress = last30DaysResults.map((product) => {
    const secondLastPeriodProduct = secondLast30DaysResults.find(
      (secondProduct) => String(secondProduct._id) === String(product._id),
    ) || { totalQuantity: 0, totalRevenue: 0 };

    const totalQuantityProgress = calculatePercentageProgress(
      product.totalQuantity,
      secondLastPeriodProduct.totalQuantity,
    );

    const totalRevenueProgress = calculatePercentageProgress(
      product.totalRevenue,
      secondLastPeriodProduct.totalRevenue,
    );

    return {
      ...product,
      progress: {
        quantityProgressPercentage: totalQuantityProgress.toFixed(2),
        revenueProgressPercentage: totalRevenueProgress.toFixed(2),
      },
    };
  });

  return topProductsWithProgress;
};

export const productServices = {
  createProduct,
  editProduct,
  addReview,
  getAllProducts,
  getAllProductsCategoryWise,
  getAllProductsByShopDashboard,
  getAllProductsByShop,

  getProductByProduct_id,
  getTopSalesProducts,
};

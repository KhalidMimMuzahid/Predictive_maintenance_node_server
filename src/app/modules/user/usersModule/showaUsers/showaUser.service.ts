import httpStatus from 'http-status';
import AppError from '../../../../errors/AppError';
import { Wallet } from '../../../wallet/wallet.model';
import { TUser } from '../../user.interface';
import { User } from '../../user.model';
import { TShowaUser } from './showaUser.interface';
import { ShowaUser } from './showaUser.model';
import { jwtFunc } from '../../../../utils/jwtFunction';
import mongoose from 'mongoose';
import { TAddress } from '../../../common/common.interface';
import S3 from 'aws-sdk/clients/s3';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createShowaUserIntoDB = async (
  rootUser: Partial<TUser>,
  showaUser: Partial<TShowaUser>,
) => {
  rootUser.followings = [];
  //create a user object
  // rootUser.role ='showa-user' // we no need to set it ; cause we have already set it as a default value in mongoose model
  // rootUser.isDeleted= false // same as above
  // rootUser.status =  'approved'  // same as above

  // checking if the user is already created with this user or not
  const isUidExists = await User.isUidExists(rootUser?.uid as string);
  if (isUidExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'uid has already in used');
  }
  const isEmailExists = await User.isEmailExists(rootUser?.email as string);
  if (isEmailExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'email has already in used');
  }
  const isPhoneExists = await User.isPhoneExists(rootUser?.phone as string);
  if (isPhoneExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'phone is already in use');
  }

  // creating the session
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const createdUserArray = await User.create([rootUser], {
      session: session,
    });
    if (!createdUserArray?.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
    }
    const createdUser = createdUserArray[0];
    const customer = await stripe.customers.create({
      email: rootUser?.email,
    });
    const createdWalletArray = await Wallet.create(
      [
        {
          ownerType: 'user',
          user: createdUser?._id,
          cards: [],
          balance: 0,
          point: 0,
          showaMB: 0,
          stripeCustomerId: customer.id,
        },
      ],
      {
        session: session,
      },
    );

    if (!createdWalletArray?.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
    }
    const createdWallet = createdWalletArray[0];

    showaUser.user = createdUser?._id;
    // showaUser.isDeleted= false // we no need to set it ; cause we have already set it as a default value in mongoose model
    const createdShowaUserArray = await ShowaUser.create([showaUser], {
      session: session,
    });
    if (!createdShowaUserArray?.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
    }

    const createdShowaUser = createdShowaUserArray[0];
    const updatedUser = await User.findByIdAndUpdate(
      createdUser?._id,
      {
        wallet: createdWallet?._id,
        showaUser: createdShowaUser?._id,
      },
      { new: true, session: session },
    );
    if (!updatedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'failed to create user');
    }

    await session.commitTransaction();
    await session.endSession();
    const user = await User.findById(createdUser?._id).populate([
      {
        path: 'showaUser',
        options: { strictPopulate: false },
      },
      // // for no we no need wallet in this api; cause for get wallet we have another api
      // {
      //   path: 'wallet',
      //   options: { strictPopulate: false },
      // },
    ]);
    const token = jwtFunc.generateToken(
      user?.email as string,
      user?._id.toString(),
      user?.uid as string,
      user?.role as string,
    );
    return { user, token };
  } catch (error) {
    // console.log({ error });

    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};
const getShowaUserFromDB = async (showaUser_id: string) => {
  const showaUser = await ShowaUser.findById(showaUser_id).populate({
    path: 'user',
    options: { strictPopulate: false },
  });
  if (!showaUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no user founded with this showaUser',
    );
  }

  return showaUser;
};
const updateAddress = async (uid: string, addressPayload: TAddress) => {
  const user = await User.findOne({ uid });
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'no user founded with this uid');
  }
  const showaUser = await ShowaUser.findById(user.showaUser);
  if (!showaUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no showa user founded with this id',
    );
  }
  showaUser.addresses?.push({ isDeleted: false, address: addressPayload });
  const updatedShowaUser = await showaUser.save();

  return { updatedShowaUser };
};

const updateProfile = async (uid: string, userData: Partial<TShowaUser>) => {
  const user = await User.findOne({ uid });
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'no user founded with this uid');
  }
  const showaUser = await ShowaUser.findById(user.showaUser);
  if (!showaUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no showa user founded with this id',
    );
  }
  if (userData.name) {
    showaUser.name = userData.name;
  }
  if (userData.gender) {
    showaUser.gender = userData.gender;
  }
  if (userData.dateOfBirth) {
    showaUser.dateOfBirth = userData.dateOfBirth;
  }
  if (userData.occupation) {
    showaUser.occupation = userData.occupation;
  }
  if (userData.photoUrl) {
    showaUser.photoUrl = userData.photoUrl;
  }
  const updatedShowaUser = await showaUser.save();

  return { showaUser: updatedShowaUser };
};

const getSignedUrl = async (fileKey: string, fileType: string) => {
  const client_s3 = new S3({
    region: 'ap-northeast-1',
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    // s3ForcePathStyle: true,
    signatureVersion: 'v4',
  });

  const fileParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileKey,
    Expires: 600,
    ContentType: fileType,
    ACL: 'bucket-owner-full-control',
  };

  const url = await client_s3.getSignedUrlPromise('putObject', fileParams);

  return { url };
};
const getShowaUserBy_user = async (user: string) => {
  const showaUser = await ShowaUser.findOne(
    {
      user: new mongoose.Types.ObjectId(user),
    },

    { name: 1, email: 1, phone: 1 },
  );
  if (!showaUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no showaUser founded with this user',
    );
  }

  return showaUser;
};

const getShowaUserByPhoneOrEmail = async (emailOrPhone: string) => {
  const user = await User.findOne({
    email: emailOrPhone,
  }).populate([
    {
      path: 'showaUser',
      options: { strictPopulate: false },
    },
  ]);
  if (user && !user.showaUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no showaUser founded with this email',
    );
  } else if (!user) {
    const showaUser = await ShowaUser.findOne({
      phone: emailOrPhone,
    }).populate([
      {
        path: 'user',
        options: { strictPopulate: false },
      },
    ]);
    if (!showaUser) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'no showaUser founded with this phone or email',
      );
    }
    return {
      ...showaUser.user,
      showaUser: { ...showaUser, user: showaUser.user._id },
    };
  }

  return user;
};

const getShowaUserContacts = async (commaSeperatedPhones: string) => {
  const phones = commaSeperatedPhones.split(',');

  const usersByphone = [];

  for (const phone of phones) {
    if (phone === '' || phone === ' ') {
      continue;
    }
    const truncatedPhone = phone.replace('-', '').replace('+', '');
    const showaUser = await ShowaUser.findOne({
      phone: { $regex: truncatedPhone },
    }).populate([
      {
        path: 'user',
        options: { strictPopulate: false },
      },
    ]);

    if (showaUser) {
      usersByphone.push({
        ...showaUser.user,
        showaUser: { ...showaUser, user: showaUser.user._id },
      });
    }
  }
  return usersByphone;
};

export const showaUserServices = {
  createShowaUserIntoDB,
  getShowaUserFromDB,
  getShowaUserBy_user,
  updateAddress,
  getSignedUrl,
  updateProfile,
  getShowaUserByPhoneOrEmail,
  getShowaUserContacts,
};

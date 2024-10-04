import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { ExtraData } from './extraData.model';
import { uploadFileToAWS } from '../../utils/uploadFileToAWS';
import mongoose from 'mongoose';
import { TExtraData, TFeedback, TInviteMember } from './extraData.interface';
import { sendMail } from '../../utils/sendMail';
import { Subscription } from '../subscription/subscription.model';
import { fileHandle } from '../../utils/fileHandle';
import { padNumberWithZeros } from '../../utils/padNumberWithZeros';
import { TAuth } from '../../interface/error';
import { subscriptionPurchasedServices } from '../subscriptionPurchased/subscriptionPurchased.service';
const deleteMyAccount = async (emailOrPhone: string) => {
  const isExistsUser = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  });

  if (isExistsUser) {
    const extraData = await ExtraData.create({
      type: 'deleteUser',
      deleteUser: { emailOrPhone },
    });
    if (!extraData) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `something went wrong, please try again`,
      );
    }
    return true;
  } else {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `no user found with ${emailOrPhone}`,
    );
  }
};

const addFeedback = async ({
  user,
  feedback,
}: {
  user: mongoose.Types.ObjectId;
  feedback: Partial<TFeedback>;
}) => {
  feedback.user = user;
  const createdFeedback = await ExtraData.create({
    type: 'feedback',
    feedback,
  });
  if (!createdFeedback) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'something went wrong, please try again',
    );
  }
  return createdFeedback;
};
const createCoupon = async ({
  numberOfCoupon,
  subscription,
  expireIn,
}: {
  numberOfCoupon: number;
  subscription: string;
  expireIn: Date;
}) => {
  // return {
  //   numberOfCoupon,
  //   subscription,
  //   expireIn,
  // };
  const subscriptionData = await Subscription.findById(subscription);
  if (!subscriptionData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'subscription has not found with subscription id you provided',
    );
  }
  const couponNumberArray = Array.from(
    { length: numberOfCoupon },
    (_, i) => i + 1,
  );

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const coupons = couponNumberArray?.map((each) => {
    const couponData: TExtraData = {
      type: 'coupon',
      coupon: {
        couponFor: subscriptionData?.package?.packageFor,
        expireIn,
        subscription: new mongoose.Types.ObjectId(subscription),
      },
    };
    return couponData;
  });

  const couponsData = await ExtraData.create(coupons);
  // https://stackoverflow.com/questions/10227107/write-to-a-csv-in-node-js
  // now make a csv file and send it to the client

  //   {
  //     Writing a CSV is pretty easy and can be done without a library.

  // import { writeFile } from 'fs/promises';
  // // you can use just fs module too

  // // Let's say you want to print a list of users to a CSV
  // const users = [
  //   { id: 1, name: 'John Doe0', age: 21 },
  //   { id: 2, name: 'John Doe1', age: 22 },
  //   { id: 3, name: 'John Doe2', age: 23 }
  // ];

  // // CSV is formatted in the following format
  // /*
  //   column1, column2, column3
  //   value1, value2, value3
  //   value1, value2, value
  // */
  // // which we can do easily by
  // const dataCSV = users.reduce((acc, user) => {
  //     acc += `${user.id}, ${user.name}, ${user.age}\n`;
  //     return acc;
  //   },
  //   `id, name, age\n` // column names for csv
  // );

  // // finally, write csv content to a file using Node's fs module
  // writeFile('mycsv.csv', dataCSV, 'utf8')
  //   .then(() => // handle success)
  //   .catch((error) => // handle error)

  //   }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const csvExtraData: any = {};

  if (subscriptionData?.package?.packageFor === 'showaUser') {
    const showaUser = subscriptionData?.package?.showaUser;
    if (showaUser?.packageType === 'basic') {
      const basic = showaUser?.basic;
      csvExtraData['applicable module'] = basic?.applicableModules?.reduce(
        (total, current, index, array) => {
          total =
            total +
            `${index === 0 && '"'}${current}\n${
              index === array?.length - 1 && '"'
            }`;
          return total;
        },
        '',
      );
      csvExtraData['total IOT'] = basic?.totalIOT;
      csvExtraData['showa MB'] = basic?.showaMB;
    } else if (showaUser?.packageType === 'standard') {
      const standard = showaUser?.standard;
      csvExtraData['total machine'] = standard?.totalMachine;
    } else if (showaUser?.packageType === 'premium') {
      const premium = showaUser?.premium;
      csvExtraData['applicable module'] = premium?.applicableModules?.reduce(
        (total, current, index, array) => {
          total =
            total +
            `${index === 0 && '"'}${current}\n${
              index === array?.length - 1 && '"'
            }`;
          return total;
        },
        '',
      );
      csvExtraData['total IOT'] = premium?.totalIOT;
      csvExtraData['total machine'] = premium?.totalMachine;
    }
  } else if (
    subscriptionData?.package?.packageFor === 'serviceProviderCompany'
  ) {
    //
  }
  const structuredData = couponsData?.map((coupon, index) => {
    return {
      's/n': padNumberWithZeros(index + 1, 5),
      couponId: coupon.id, // _id of predefined value
      couponFor: 'showaUser',
      ...csvExtraData,
      // package: subscriptionData?.package?.packageFor,
      expireIn: `"${coupon[coupon?.type]?.expireIn?.toLocaleDateString(
        'en-US',
        {
          year: 'numeric',
          month: 'long', // e.g., October
          day: 'numeric',
        },
      )}"`,
      createdAt: `"${coupon['createdAt']?.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', // e.g., October
        day: 'numeric',
      })}"`,
      validityFromActivation: `${subscriptionData?.validity} days`,
      features: subscriptionData?.features?.reduce(
        (total, current, index, array) => {
          total =
            total +
            `${index === 0 && '"'}${current}\n${
              index === array?.length - 1 && '"'
            }`;
          return total;
        },
        '',
      ),
    };
  });
  const csvData = fileHandle.jsonToCsv(structuredData);
  return csvData;
};

const activateCoupon = async ({
  coupon,
  auth,
}: {
  coupon: string;
  auth: TAuth;
}) => {
  const predefinedValueForCouponData = await ExtraData.findOne({
    _id: new mongoose.Types.ObjectId(coupon),
    type: 'coupon',
  });
  if (!predefinedValueForCouponData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no coupon has found with the id you provided',
    );
  }
  const couponData = predefinedValueForCouponData?.coupon;
  const result = await subscriptionPurchasedServices.createSubscription({
    subscription: couponData?.subscription?.toString(),
    user: auth?._id,
  });

  return result;
};
const inviteMember = async ({
  inviteMember,
}: {
  inviteMember: Partial<TInviteMember>;
}) => {
  const extraData = await ExtraData.create({
    type: 'inviteMember',
    inviteMember,
  });
  if (!extraData?._id) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'something went wrong, please try again',
    );
  }

  const htmlBody = `<div>
            <h2 style="color: #333; margin-bottom: 20px;">You're invited to sign-up as a ${inviteMember?.type}.</h2>
           
    <div style="margin-top: 20px;">
                <h3 style="color: #555; margin: 5px 0;">Email: ${inviteMember[
                  inviteMember?.type
                ]?.email}</h3>
            </div>

            <a href=${'https://showa.page.link/registration'} target="_blank" style="display: inline-block; background-color: #1a73e8; color: #fff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; transition: background-color 0.3s, transform 0.2s;">
                Click here to sign-up
            </a>
            <div style="margin-top: 20px;">
                <h3 style="color: #333; margin: 5px 0;">Best regards</h3>
                <h4 style="color: #333; margin: 5px 0;">Admin: Showa</h4>
            </div>
        </div>`;

  const result = await sendMail({
    receiverEmail: inviteMember[inviteMember?.type]?.email,
    subjectLine: 'You are invited to join us',
    htmlBody,
  });
  return result;
};

const invitedMemberById = async (invitedMember: string) => {
  const extraData = await ExtraData.findOne({
    _id: new mongoose.Types.ObjectId(invitedMember),
    type: 'inviteMember',
  });

  return extraData?.inviteMember;
};

const invitedMemberByEmail = async (email: string) => {
  const extraData = await ExtraData.findOne({
    $or: [
      { 'inviteMember.serviceProviderAdmin.email': email },
      { 'inviteMember.showaUser.email': email },
      { 'inviteMember.serviceProviderEngineer.email': email },
      { 'inviteMember.serviceProviderBranchManager.email': email },
    ],
    type: 'inviteMember',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = extraData?.inviteMember as unknown as any;
  data._id = extraData?._id;
  return data;
};
const reviewFeedback = async (feedback: string) => {
  const updatedFeedback = await ExtraData.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(feedback),
      type: 'feedback',
    },
    {
      'feedback.isReviewed': true,
    },
  );

  if (!updatedFeedback) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'something went wrong, please try again',
    );
  }

  return null;
};

const uploadPhoto = async ({
  file,
  folder,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file: any;
  folder: string;
}) => {
  const fileType = file?.mimetype;
  const fileName = file?.name;
  const key = `${'assets/' + folder + '/' + Date.now().toString() + fileName}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uploadedFile = (await uploadFileToAWS({ key, file })) as unknown as any;
  return { url: uploadedFile?.Location, fileType, fileName };
};
export const extraDataServices = {
  deleteMyAccount,
  addFeedback,
  createCoupon,
  activateCoupon,
  inviteMember,
  invitedMemberById,
  invitedMemberByEmail,
  reviewFeedback,
  uploadPhoto,
};

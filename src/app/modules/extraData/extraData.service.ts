import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { ExtraData } from './extraData.model';
import { uploadFileToAWS } from '../../utils/uploadFileToAWS';
import mongoose from 'mongoose';
import { TFeedback } from './extraData.interface';

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
  reviewFeedback,
  uploadPhoto,
};

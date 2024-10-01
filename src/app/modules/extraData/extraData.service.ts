import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { ExtraData } from './extraData.model';
import { uploadFileToAWS } from '../../utils/uploadFileToAWS';
import mongoose from 'mongoose';
import { TFeedback, TInviteMember } from './extraData.interface';
import { sendMail } from '../../utils/sendMail';

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
  inviteMember,
  invitedMemberById,
  invitedMemberByEmail,
  reviewFeedback,
  uploadPhoto,
};

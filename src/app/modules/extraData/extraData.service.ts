import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { ExtraData } from './extraData.model';
import S3 from 'aws-sdk/clients/s3';

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

const uploadPhoto = async ({
  fileName,
  fileType,
  file,
  folder,
}: {
  fileName: string;
  fileType: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file: any;
  folder: string;
}) => {
  const s3 = new S3({
    params: { Bucket: process.env.S3_BUCKET_NAME },
    region: 'ap-northeast-1',
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    // s3ForcePathStyle: true,
    signatureVersion: 'v4',
  });

  const fileParams = {
    Key: `${'assets/' + folder + '/' + fileName}`,
    Expires: 600,
    ContentType: fileType,
    Body: file,
    ACL: 'bucket-owner-full-control',
  };

  const url = await s3.getSignedUrlPromise('putObject', fileParams);

  return { url };
};
export const extraDataServices = {
  deleteMyAccount,
  uploadPhoto,
};

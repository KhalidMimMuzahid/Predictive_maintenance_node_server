import config from '../config';
import AWS from 'aws-sdk';

export const uploadFileToAWS = async ({
  key,
  // fileType,
  file,
}: {
  key: string;
  // fileType: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file: any;
}) => {
  const s3 = new AWS.S3({
    params: { Bucket: process.env.S3_BUCKET_NAME },
    region: 'ap-northeast-1',
    credentials: {
      accessKeyId: config.awsAccessKey,
      secretAccessKey: config.awsSecretKey,
    },
    // accessKeyId: process.env.AWS_ACCESS_KEY,
    // secretAccessKey: process.env.AWS_SECRET_KEY,
    // s3ForcePathStyle: true,
    signatureVersion: 'v4',
  });
  // console.log('file: ', file);
  const params = {
    Bucket: config.s3BucketName,
    Key: key,
    Body: file?.data, // file?.data
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, {}, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

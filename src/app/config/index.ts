import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '/.env') });

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.SHOWA_DB_URL,
  awsAccessKey: process.env.AWS_ACCESS_KEY,
  awsSecretKey: process.env.AWS_SECRET_KEY,
  s3BucketName: process.env.S3_BUCKET_NAME,
  fbAppSecret: process.env.FB_APP_SECRET,
  stripeSecretKey:
    'sk_test_51MZR3YLOxcssGcoPHE0rDabPsdyb0QCxQg4JstuCINfk6W4BHdbJnBA2jobJZXY3aK9h6EKhiBN8s7OEhc6Y0VTI00RIOc0YiJ',
  saltRound: process.env.BCRYPT_SALT_ROUND,
  defaultPass: process.env.DEFAULT_PASS,
  privateKey: process.env.PRIVATE_KEY,
};

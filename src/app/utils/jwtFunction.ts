import jwt, { JwtPayload } from 'jsonwebtoken';
// import config from '../config';
import { Types } from 'mongoose';

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    email: string;
    _id: string | Types.ObjectId;
    uid: string;
  }
}

const generateToken = (
  email: string,
  _id: string = '',
  uid: string = '',
  role: string = '',
) => {
  const token = jwt.sign(
    { email, _id, uid, role },
    process.env.PRIVATE_KEY as string,
    {
      algorithm: 'HS256',
      expiresIn: '7d',
    },
  );
  return token;
};
const decodeToken = (token: string) => {
  const decoded = jwt.verify(
    token,
    process.env.PRIVATE_KEY as string,
  ) as JwtPayload;
  return decoded;
};

export const jwtFunc = {
  generateToken,
  decodeToken,
};

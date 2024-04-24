import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
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
    config?.privateKey as string,
    {
      algorithm: 'HS256',
      expiresIn: '24h',
    },
  );
  return token;
};
const decodeToken = (token: string) => {
  const decoded = jwt.verify(token, config.privateKey as string) as JwtPayload;
  return decoded;
};

export const jwtFunc = {
  generateToken,
  decodeToken,
};

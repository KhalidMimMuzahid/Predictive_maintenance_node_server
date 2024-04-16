import jwt from 'jsonwebtoken';
import config from '../config';

const generateToken = (email: string, _id: string = '', uid: string = '') => {
  const token = jwt.sign({ email, _id, uid }, config?.privateKey as string, {
    algorithm: 'HS256',
    expiresIn: '24h',
  });
  return token;
};
const decodeToken = (token: string) => {
  const decoded = jwt.verify(token, config.privateKey as string);
  return decoded;
};

export const jwtFunc = {
  generateToken,
  decodeToken,
};

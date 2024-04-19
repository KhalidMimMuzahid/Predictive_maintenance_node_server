import { RequestHandler } from 'express';
import catchAsync from '../utils/catchAsync';
import { jwtFunc } from '../utils/jwtFunction';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';
import url from 'url';
import { Types } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';
import { ShowaRequest } from '../interface/showaRequest';

export const manageAuth: RequestHandler = catchAsync(
  async (req: ShowaRequest, res, next) => {
    try {
      const parsedUrl = url.parse(req?.url);
      const pathname: string = parsedUrl?.pathname as string;

      if (pathname?.endsWith('sign-up') || pathname?.endsWith('sign-in')) {
        return next();
      } else {
        const bearerToken = req.headers['authorization']?.split(' ')[1];

        let auth: JwtPayload;
        try {
          auth = jwtFunc?.decodeToken(bearerToken as string);
        } catch (error) {
          throw new AppError(
            httpStatus.FORBIDDEN,
            'Your access token is expired or unauthorized user detected. \n please sign-in agin',
          );
        }

        delete auth.iat;
        delete auth.exp;
        if (!auth?.email || !auth?._id || !auth?.uid) {
          throw new AppError(
            httpStatus.FORBIDDEN,
            'Your access token is expired or unauthorized user detected. \n please sign-in agin',
          );
        }
        auth._id = new Types.ObjectId(auth?._id);

        req.headers['auth'] = auth;
        return next();
      }
    } catch (error) {
      // console.log({ error });
      return next(error);
    }
  },
);

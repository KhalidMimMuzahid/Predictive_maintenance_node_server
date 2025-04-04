import { RequestHandler } from 'express';
import catchAsync from '../utils/catchAsync';
import { jwtFunc } from '../utils/jwtFunction';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';
import url from 'url';
import { Types } from 'mongoose';
export const manageAuth: RequestHandler = catchAsync(async (req, res, next) => {
  try {
    const parsedUrl = url.parse(req?.url);
    const pathname: string = parsedUrl?.pathname as string;

    if (
      pathname?.endsWith('/') ||
      pathname?.endsWith('sign-up') ||
      pathname?.endsWith('sign-in') ||
      pathname?.endsWith('add-sensor-data') ||
      pathname?.endsWith('upload-photo') ||
      pathname?.endsWith('upload-image') ||
      pathname?.endsWith('invited-member-by-id') ||
      pathname?.endsWith('invited-member-by-email') ||
      pathname?.endsWith('machine-health-status') ||
      pathname?.endsWith('get-all-sensor-section-wise-by-machine') ||
      pathname?.endsWith('get-all-thresholds') ||
      pathname?.endsWith('get-ai-data') ||
      pathname?.endsWith('get-sensor-data-by-category-type-brand-model-wise') ||
      pathname?.endsWith('delete-my-account') ||
      pathname?.endsWith('webhook-for-stripe') ||
      pathname?.endsWith('testing')
    ) {
      return next();
    } else {
      const bearerToken = req.headers['authorization']?.split(' ')[1];

      let auth;
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
      if (!auth?.email || !auth?._id || !auth?.uid || !auth?.role) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Your access token is expired or unauthorized user detected. \n please sign-in agin',
        );
      }

      auth._id = new Types.ObjectId(auth?._id);
      // console.log({ auth });
      req.headers.auth = auth;
      return next();
    }
  } catch (error) {
    // console.log({ error });
    return next(error);
  }
});

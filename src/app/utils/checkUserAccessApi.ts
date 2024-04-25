import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import { TAuth } from '../interface/error';
import { TRole } from '../modules/user/user.interface';

export const checkUserAccessApi = ({
  auth,
  accessUsers,
}: {
  auth: TAuth;
  accessUsers: TRole[] | 'all';
}) => {
  if (accessUsers === 'all') {
    // do nothing; just pass;
  } else if (accessUsers.some((role) => role === auth.role)) {
    // do nothing; just pass;
  } else {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'you have no right to access this api',
    );
  }
};

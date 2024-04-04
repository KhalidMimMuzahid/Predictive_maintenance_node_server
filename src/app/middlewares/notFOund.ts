/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';

/* eslint-disable @typescript-eslint/no-explicit-any */
const notFoundErrorHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = httpStatus.NOT_FOUND;
  const message = 'API Not Found!';
  return res.status(statusCode).json({
    success: false,
    message,
    error: '',
  });
};

export default notFoundErrorHandler;

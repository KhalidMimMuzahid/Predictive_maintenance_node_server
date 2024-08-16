import { NextFunction, Request, RequestHandler, Response } from 'express';

// this is higher order function in javascript

const catchAsync = (fn: RequestHandler) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

export default catchAsync;

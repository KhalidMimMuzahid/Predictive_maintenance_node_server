import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      //validation check
      //if everything allright then next() -->

      await schema.parseAsync(req.body);

      return next();
    } catch (error) {
      // console.log({ error });
      next(error);
    }
  };
};

export default validateRequest;

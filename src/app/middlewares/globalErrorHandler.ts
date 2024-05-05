/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { TErrorSources } from '../interface/error';
// import config from '../config';
import handleZodError from '../errors/handleZodError';
import handleValidationError from '../errors/handleValidationError';
import handleCastError from '../errors/handleCastError';
import handleDuplicateError from '../errors/handleDuplicateError';
import AppError from '../errors/AppError';

// if we use ErrorRequestHandler type we no need to declare the type of those {any Request Response NextFunction}
const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  // console.log({ error });
  let statusCode = 500;
  let message = 'Something went wrong!';

  let errorSources: TErrorSources = [
    {
      path: '',
      message: 'Something went wrong!',
    },
  ];
  if (error instanceof ZodError) {
    const simplifiesError = handleZodError(error);
    // errorSources

    statusCode = simplifiesError?.statusCode;
    message = simplifiesError?.message;
    errorSources = simplifiesError?.errorSources;
  } else if (error?.name === 'ValidationError') {
    const simplifiesError = handleValidationError(error);
    // errorSources

    statusCode = simplifiesError?.statusCode;
    message = simplifiesError?.message;
    errorSources = simplifiesError?.errorSources;
  } else if (error?.name === 'CastError') {
    const simplifiesError = handleCastError(error);
    // errorSources

    statusCode = simplifiesError?.statusCode;
    message = simplifiesError?.message;
    errorSources = simplifiesError?.errorSources;
  } else if (error?.code === 11000) {
    const simplifiesError = handleDuplicateError(error);
    // errorSources

    statusCode = simplifiesError?.statusCode;
    message = simplifiesError?.message;
    errorSources = simplifiesError?.errorSources;
  } else if (error instanceof AppError) {
    statusCode = error?.statusCode;
    message = error?.message;
    errorSources = [
      {
        path: '',
        message: error?.message,
      },
    ];
  } else if (error instanceof Error) {
    message = error?.message;
    errorSources = [
      {
        path: '',
        message: error?.message,
      },
    ];
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: process.env.NODE_ENV === 'development' ? error?.stack : null,
    error,
  });
};

export default globalErrorHandler;

//pattern
/*
success
message
errorSources : [
  path: "",
  message: "Something"
]
stack
*/

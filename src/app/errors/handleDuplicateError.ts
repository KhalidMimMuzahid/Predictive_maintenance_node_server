/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSources, TGenericErrorResponse } from './../interface/error';

const handleDuplicateError = (error: any): TGenericErrorResponse => {
  const errorSources: TErrorSources = [
    {
      path: Object.keys(error?.keyValue)[0],
      message: `"${error?.keyValue?.[
        Object.keys(error?.keyValue)[0]
      ]}" is already exists`,
    },
  ];

  const statusCode = 400;
  return {
    statusCode,
    message: 'Duplicate Error',
    errorSources,
  };
};

export default handleDuplicateError;

export type TErrorSources = { path: string | number; message: string }[];


export type TGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorSources: TErrorSources;
};

export type TAuth = { email: string; _id: string; uid: string };
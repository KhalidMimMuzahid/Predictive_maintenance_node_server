import { RequestHandler } from 'express';
import catchAsync from '../../../utils/catchAsync';
import { TAuth } from '../../../interface/error';
import { checkUserAccessApi } from '../../../utils/checkUserAccessApi';
import sendResponse from '../../../utils/sendResponse';
import httpStatus from 'http-status';

const createProduct: RequestHandler = catchAsync(async (req, res) => {
  const auth: TAuth = req?.headers?.auth as unknown as TAuth;

  // we are checking the permission of this api
  checkUserAccessApi({ auth, accessUsers: ['showaAdmin', 'showaSubAdmin'] });
  // const machine: string = req?.query?.machine as string;

  // if (!machine) {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     '_id of machine is required for creating a reservation',
  //   );
  // }

  // problem: {
  //   issues: { title: string; issue: string }[]; // all issues title one by one
  //   problemDescription?: string;
  //   images: { image: string; title?: string }[];
  // };
  // schedule: {
  //   category:
  //     | 'on-demand'
  //     | 'within-one-week'
  //     | 'within-two-week'
  //     | 'custom-date-picked';
  //   // date: Date;
  //   schedules: Date[]; // every schedule will be stored here , if you re schedule this request 5 times, this array will hold five different date
  // };
  // const problem = req?.body?.problem as TProblem;
  // const schedule = req?.body?.schedule as TSchedule;
  // const result = await reservationServices.createReservationRequestIntoDB({
  //   user: auth?._id,
  //   machine_id: machine,
  //   problem,
  //   schedule,
  // });
  // send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reservation Request created successfully',
    data: 'result',
  });
});

export const productController = {
  createProduct,
};

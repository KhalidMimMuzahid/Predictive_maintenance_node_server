import { Types } from 'mongoose';
import {
  TProblem,
  TReservationRequest,
  TSchedule,
} from './reservation.interface';
import { ReservationRequest } from './reservation.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { Machine } from '../machine/machine.model';
import { padNumberWithZeros } from '../../utils/padNumberWithZeros';
import S3 from 'aws-sdk/clients/s3';
const createReservationRequestIntoDB = async ({
  user,
  machine_id,
  problem,
  schedule,
}: {
  user: Types.ObjectId;
  machine_id: string;
  problem: TProblem;
  schedule: TSchedule;
}) => {
  let machine: Types.ObjectId;
  try {
    machine = new Types.ObjectId(machine_id);
  } catch (error) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      '_id of machine you provided is invalid',
    );
  }
  const machineData = await Machine.findById(machine);

  if (!machineData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      '_id of machine you provided is no found',
    );
  }
  if (machineData?.user?.toString() !== user?.toString()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'you are not owner of this machine',
    );
  }
  const isAlreadyReservation = await ReservationRequest.findOne({
    user: user,
    machine: machine,

    status: { $nin: ['completed', 'canceled'] },
  });

  if (isAlreadyReservation) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This machine is already reserved and its not completed',
    );
  }
  const reservationRequest: Partial<TReservationRequest> = {};

  const lastCreatedRequest = await ReservationRequest.findOne(
    { user },
    { requestId: 1 },
  ).sort({ _id: -1 });

  reservationRequest.requestId = padNumberWithZeros(
    Number(lastCreatedRequest?.requestId || '0000') + 1,
    4,
  );

  if (schedule?.category === 'custom-date-picked') {
    if (schedule?.schedules?.length !== 1) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "you've chosen custom-date-picked but you have not sent it ",
      );
    }
  } else if (schedule?.category === 'on-demand') {
    // do nothing: What does mean by "on-demand"?
  } else if (schedule?.category === 'within-one-week') {
    // from now, add 7 days;  set schedule?.schedules[0]
  } else if (schedule?.category === 'within-two-week') {
    // from now, add 14 days;  set schedule?.schedules[0]
  }
  reservationRequest.machine = machine;
  reservationRequest.user = user;
  reservationRequest.problem = problem;
  reservationRequest.schedule = schedule;
  reservationRequest.status = 'pending';
  reservationRequest.date = new Date(); // we should convert this date to japan/korean local time
  reservationRequest.machineType = machineData?.category;

  reservationRequest.isSensorConnected = machineData.sensorModulesAttached
    ?.length
    ? true
    : false;
  const result = await ReservationRequest.create(reservationRequest);
  return result;
};

const getMyReservationsService = async (uid: string | Types.ObjectId) => {
  const results = await ReservationRequest.find({ user: uid }).populate('user');

  return results;
};

const getMyReservationsByStatusService = async (
  uid: string | Types.ObjectId,
  status: string,
) => {
  const results = await ReservationRequest.find({
    user: uid,
    status: status,
  })
    .populate('user')
    .populate('machine');

  return results;
};

const getReservationsByStatusService = async (status: string) => {
  const results = await ReservationRequest.find({ status: status })
    .populate('user')
    .populate('machine')
    .sort({ createdAt: -1 });

  return results;
};

const getSignedUrl = async (fileKey: string, fileType: string) => {
  const client_s3 = new S3({
    region: 'ap-northeast-1',
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    // s3ForcePathStyle: true,
    signatureVersion: 'v4',
  });

  const fileParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileKey,
    Expires: 600,
    ContentType: fileType,
    ACL: 'bucket-owner-full-control',
  };

  const url = await client_s3.getSignedUrlPromise('putObject', fileParams);

  return { url };
};

export const reservationServices = {
  createReservationRequestIntoDB,
  getMyReservationsService,
  getMyReservationsByStatusService,
  getReservationsByStatusService,
  getSignedUrl,
};

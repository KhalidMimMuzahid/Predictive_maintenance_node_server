import S3 from 'aws-sdk/clients/s3';
import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { addDays } from '../../utils/addDays';
import { padNumberWithZeros } from '../../utils/padNumberWithZeros';
import { sortByCreatedAtDescending } from '../../utils/sortByCreatedAtDescending';
import { Invoice } from '../invoice/invoice.model';
import { Machine } from '../machine/machine.model';
import { ReservationRequestGroup } from '../reservationGroup/reservationGroup.model';
import { ServiceProviderCompany } from '../serviceProviderCompany/serviceProviderCompany.model';
import { TSubscriptionPurchased } from '../subscriptionPurchased/subscriptionPurchased.interface';
import {
  TMachineType,
  TMachineType2,
  TProblem,
  TReservationRequest,
  TReservationType,
  TSchedule,
} from './reservation.interface';
import { ReservationRequest } from './reservation.model';
import { TAuth } from '../../interface/error';
import { isEngineerBelongsToThisTeamByReservation } from '../invoice/invoice.utils';

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
  // let machine: Types.ObjectId;
  // try {
  //   machine = new Types.ObjectId(machine_id);
  // } catch (error) {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     '_id of machine you provided is invalid',
  //   );
  // }
  // console.log(machine)
  const machineData = await Machine.findById(machine_id).populate({
    path: 'subscriptionPurchased',
    select: 'isActive',
    options: { strictPopulate: false },
  });
  // console.log(machineData);
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
  const subscriptionPurchased =
    machineData?.subscriptionPurchased as unknown as TSubscriptionPurchased;
  // console.log(machineData);
  if (!subscriptionPurchased?.isActive) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Your subscription has expired for this machine, please renew your subscription',
    );
  }

  const isAlreadyReservation = await ReservationRequest.findOne({
    user: user,
    machine: new mongoose.Types.ObjectId(machine_id),

    status: { $nin: ['completed', 'canceled'] },
  });

  if (isAlreadyReservation) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This machine is already reserved and it has not been completed or cancel yet',
    );
  }
  const reservationRequest: Partial<TReservationRequest> = {};

  const lastCreatedRequest = await ReservationRequest.findOne(
    {},
    { requestId: 1 },
  ).sort({ _id: -1 });

  reservationRequest.requestId = padNumberWithZeros(
    Number(lastCreatedRequest?.requestId || '000000') + 1,
    6,
  );

  reservationRequest.machine = new mongoose.Types.ObjectId(machine_id);
  reservationRequest.user = user;
  reservationRequest.problem = problem;
  reservationRequest.schedule = schedule;
  reservationRequest.status = 'pending';
  // reservationRequest.date = new Date(); // we should convert this date to japan/korean local time
  reservationRequest.machineType = machineData?.category;

  reservationRequest.isSensorConnected = machineData.sensorModulesAttached
    ?.length
    ? true
    : false;
  if (schedule?.category === 'custom-date-picked') {
    if (schedule?.schedules?.length !== 1) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "you've chosen custom-date-picked but you have not sent it ",
      );
    }
    const dateString = schedule?.schedules[0];
    if (new Date() > new Date(dateString)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'The date you have chosen is past date, please select future date',
      );
    }
  } else if (schedule?.category === 'within-one-week') {
    // from now, add 7 days;  set schedule?.schedules[0]
    schedule.schedules = [];
    schedule.schedules.push(addDays(7));
  } else if (schedule?.category === 'within-two-week') {
    // from now, add 14 days;  set schedule?.schedules[0]
    schedule.schedules = [];
    schedule.schedules.push(addDays(14));
  } else if (schedule?.category === 'on-demand') {
    // do nothing: What does mean by "on-demand"?

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      reservationRequest.schedule.schedules = undefined;
      const createdReservationRequestArray = await ReservationRequest.create(
        [reservationRequest],
        {
          session,
        },
      );
      if (!createdReservationRequestArray?.length) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'could not create reservation request, please try again',
        );
      }

      const createdReservationRequest = createdReservationRequestArray[0];
      // console.log({ result });
      // return result;

      const groupForMachineType: TMachineType =
        createdReservationRequest.isSensorConnected
          ? 'connected'
          : 'non-connected';

      const lastAddedReservationGroup = await ReservationRequestGroup.findOne(
        {},
        { groupId: 1 },
      ).sort({ _id: -1 });

      const groupId = padNumberWithZeros(
        Number(lastAddedReservationGroup?.groupId || '00000') + 1,
        5,
      );

      const reservationGroupArray = await ReservationRequestGroup.create(
        [
          {
            reservationRequests: [createdReservationRequest?._id],
            groupForMachineType,
            groupId: groupId,
            groupName: 'Automated-grouped',
            isOnDemand: true,
          },
        ],
        { session: session },
      );

      if (!reservationGroupArray?.length) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'failed to create reservation group',
        );
      }
      const reservationGroup = reservationGroupArray[0];

      createdReservationRequest.reservationRequestGroup = reservationGroup?._id;
      const updatedReservationRequest = await createdReservationRequest.save({
        session,
      });

      if (updatedReservationRequest) {
        if (!reservationGroupArray?.length) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            'failed to create reservation request',
          );
        }
      }

      await session.commitTransaction();
      await session.endSession();
      return updatedReservationRequest;
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw error;
    }
  }

  const result = await ReservationRequest.create(reservationRequest);
  return result;
};
const reschedule = async ({
  reservationRequest,
  rescheduleData,
  auth,
}: {
  reservationRequest: string;
  rescheduleData: {
    schedule: string;
    reasonOfReSchedule?: string;
  };
  auth: TAuth;
}) => {
  // const invoiceData = (await Invoice.findOne({
  //   reservationRequest: new mongoose.Types.ObjectId(reservationRequest),
  // })
  //   .select('invoiceGroup')
  //   .populate([
  //     {
  //       path: 'invoiceGroup',
  //       select: 'taskAssignee.teamOfEngineers',
  //       populate: {
  //         path: 'taskAssignee.teamOfEngineers',
  //         // select: 'taskAssignee.teamOfEngineers',
  //         select: 'members.member',
  //         populate: {
  //           path: 'members.member',
  //           select: 'user',
  //           options: { strictPopulate: false },
  //         },
  //       },
  //     },
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   ])) as unknown as any;

  // const teamOfEngineersArray =
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   invoiceData?.invoiceGroup?.taskAssignee?.teamOfEngineers?.members as any[];
  // const engineerExistsInThisTeam = teamOfEngineersArray.findIndex(
  //   (each) => each?.user?.toString() === auth?._id,
  // );

  const engineerExistsInThisTeam = isEngineerBelongsToThisTeamByReservation({
    reservationRequest,
    user: auth?._id,
  });
  if (engineerExistsInThisTeam) {
    const updatedReservationRequest =
      await ReservationRequest.findByIdAndUpdate(reservationRequest, {
        reasonOfReSchedule: rescheduleData?.reasonOfReSchedule,
        $push: { 'schedule.schedules': new Date(rescheduleData.schedule) },
      });

    return updatedReservationRequest;
  } else {
    // return error
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'you are not in the team that has assigned in this reservation',
    );
  }
};
const getMyReservationsService = async (uid: string | Types.ObjectId) => {
  const results = await ReservationRequest.find({ user: uid })
    .populate({
      path: 'user',
      populate: { path: 'showaUser', options: { strictPopulate: false } },
    })
    .populate('machine');

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
    .populate({
      path: 'user',
      populate: { path: 'showaUser', options: { strictPopulate: false } },
    })
    .populate('machine');

  return results;
};

const getReservationsByStatusService = async (status: string) => {
  const results = await ReservationRequest.find({ status: status })
    .populate({
      path: 'user',
      populate: { path: 'showaUser', options: { strictPopulate: false } },
    })
    .populate('machine')
    .sort({ createdAt: -1 });

  return results;
};

const getAllReservationsService = async ({
  machineType,
  reservationType,
}: {
  machineType: TMachineType;
  reservationType: TReservationType;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterQuery: any = {};
  if (machineType === 'connected') {
    if (reservationType === 'rescheduled') {
      const result = await ReservationRequest.aggregate([
        {
          $match: {
            isSensorConnected: true,
            'schedule.schedules': { $exists: true },
          },
        },
        {
          $addFields: {
            schedulesCount: { $size: '$schedule.schedules' },
          },
        },
        {
          $match: {
            schedulesCount: { $gt: 1 },
          },
        },
      ]);
      return result;
    }
    filterQuery['isSensorConnected'] = true;
  } else if (machineType === 'non-connected') {
    if (reservationType === 'rescheduled') {
      const result = await ReservationRequest.aggregate([
        {
          $match: {
            isSensorConnected: false,
            'schedule.schedules': { $exists: true },
          },
        },
        {
          $addFields: {
            friendsCount: { $size: '$schedule.schedules' },
          },
        },
        {
          $match: {
            friendsCount: { $gt: 1 },
          },
        },
      ]);
      return result;
    }
    filterQuery['isSensorConnected'] = false;
  }

  if (reservationType === 'all') {
    //do nothing
  } else if (reservationType === 'on-demand') {
    filterQuery['schedule.category'] = 'on-demand';
  } else if (reservationType === 'within-one-week') {
    filterQuery['schedule.category'] = 'within-one-week';
  } else if (reservationType === 'within-two-week') {
    filterQuery['schedule.category'] = 'within-two-week';
  } else if (reservationType === 'scheduled') {
    filterQuery['schedule.schedules'] = { $size: 1 }; // for rescheduled; we handle it above
  } else if (reservationType === 'pending') {
    filterQuery['status'] = 'pending';
  } else if (reservationType === 'accepted') {
    filterQuery['status'] = 'accepted';
  } else if (reservationType === 'ongoing') {
    filterQuery['status'] = 'ongoing';
  } else if (reservationType === 'completed') {
    filterQuery['status'] = 'completed';
  }

  const result = await ReservationRequest.find(filterQuery).populate('user');

  return result;
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

const getAllReservationsByUser = async (user: string) => {
  const reservations = await ReservationRequest.find({ user }).populate([
    { path: 'machine', options: { strictPopulate: false } },
    {
      path: 'reservationRequestGroup',
      populate: {
        path: 'postBiddingProcess.serviceProviderCompany',
        options: { strictPopulate: false },
      },
    },
  ]);

  return reservations;
};
const getAllReservationsByServiceProviderCompany = async (
  serviceProviderCompany: string,
) => {
  const reservations = await Invoice.find({
    'postBiddingProcess.serviceProviderCompany': new mongoose.Types.ObjectId(
      serviceProviderCompany,
    ),
  }).populate([
    { path: 'reservationRequest', options: { strictPopulate: false } },
  ]);
  return reservations;
};

const getAllScheduledReservationsByServiceProviderCompany = async (
  serviceProviderCompany: string,
) => {
  // filterQuery['schedule.schedules'] = { $size: 1 };

  const reservations = await Invoice.find({
    'postBiddingProcess.serviceProviderCompany': new mongoose.Types.ObjectId(
      serviceProviderCompany,
    ),
  }).populate([
    { path: 'reservationRequest', options: { strictPopulate: false } },
  ]);
  // eslint-disable-next-line prefer-const
  let allScheduledReservationsUnsorted = [];
  reservations.forEach((each) => {
    const reservationRequest: TReservationRequest =
      each?.reservationRequest as unknown as TReservationRequest;
    if (reservationRequest?.schedule?.schedules?.length) {
      allScheduledReservationsUnsorted.push(each);
    }
  });
  const allScheduledReservations = sortByCreatedAtDescending({
    array: allScheduledReservationsUnsorted,
    sort: 'desc',
  });
  return allScheduledReservations;
};

const getReservationCountByServiceProviderCompany = async (
  serviceProviderCompany: string,
) => {
  const orderReceivedReservationsCount = await Invoice.countDocuments({
    'postBiddingProcess.serviceProviderCompany': new mongoose.Types.ObjectId(
      serviceProviderCompany,
    ),
  });
  const orderCompletedReservationsCount = await Invoice.countDocuments({
    'postBiddingProcess.serviceProviderCompany': new mongoose.Types.ObjectId(
      serviceProviderCompany,
    ),
    taskStatus: 'completed',
  });
  const orderCanceledReservationsCount = await Invoice.countDocuments({
    'postBiddingProcess.serviceProviderCompany': new mongoose.Types.ObjectId(
      serviceProviderCompany,
    ),
    taskStatus: 'canceled',
  });
  return {
    orderReceivedReservationsCount,
    orderCompletedReservationsCount,
    orderCanceledReservationsCount,
  };
};
const getAllReservationsCount = async (machineType: TMachineType2) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterQuery: any = {};

  if (machineType === 'general-machine') {
    filterQuery['machineType'] = 'general-machine';
  } else if (machineType === 'washing-machine') {
    filterQuery['machineType'] = 'washing-machine';
  }

  const all = await ReservationRequest.countDocuments(filterQuery);
  const onDemand = await ReservationRequest.countDocuments({
    ...filterQuery,
    'schedule.category': 'on-demand',
  });
  const accepted = await ReservationRequest.countDocuments({
    ...filterQuery,
    status: 'accepted',
  });
  const ongoing = await ReservationRequest.countDocuments({
    ...filterQuery,
    status: 'ongoing',
  });
  const completed = await ReservationRequest.countDocuments({
    ...filterQuery,
    status: 'completed',
  });
  const canceled = await ReservationRequest.countDocuments({
    ...filterQuery,
    status: 'canceled',
  });

  return { all, onDemand, accepted, ongoing, completed, canceled };
};

const getReservationRequestForServiceProviderCompany = async (
  resType: string,
  adminUserid: mongoose.Types.ObjectId,
) => {
  const serviceProviderCompany = await ServiceProviderCompany.findOne({
    serviceProviderAdmin: adminUserid,
  });

  const matchQuery = {
    'postBiddingProcess.serviceProviderCompany': serviceProviderCompany._id,
  };
  if (resType !== 'rescheduled') {
    matchQuery['taskStatus'] = resType;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let aggArray: any;
  if (resType === 'rescheduled') {
    aggArray = [
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: 'reservationrequests',
          localField: 'reservationRequest',
          foreignField: '_id',
          as: 'reservationRequest',
        },
      },
      {
        $unwind: '$reservationRequest',
      },
      {
        $replaceRoot: {
          newRoot: '$reservationRequest',
        },
      },
      {
        $addFields: {
          schedulesCount: { $size: '$schedule.schedules' },
        },
      },
      {
        $match: {
          schedulesCount: { $gt: 1 },
        },
      },
    ];
  } else {
    aggArray = [
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: 'reservationrequests',
          localField: 'reservationRequest',
          foreignField: '_id',
          as: 'reservationRequest',
        },
      },
      {
        $unwind: '$reservationRequest',
      },
      {
        $replaceRoot: {
          newRoot: '$reservationRequest',
        },
      },
    ];
  }
  const result = await Invoice.aggregate(aggArray);

  return result;
};

const deleteReservation = async (reservationRequest: string) => {
  const invoice = await Invoice.findOne({ reservationRequest });

  if (!invoice) {
    //
  } else {
    //
    // check  reservationGroup
  }

  return invoice;
};

const getDashboardScreenAnalyzingForServiceProviderCompany = async (
  serviceProviderCompanyId: string,
) => {
  const serviceProviderCompany = await ServiceProviderCompany.findById(
    serviceProviderCompanyId,
  );

  if (!serviceProviderCompany) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Service provider company not found',
    );
  }

  const serviceProviderCompanyObjectId = new mongoose.Types.ObjectId(
    serviceProviderCompanyId,
  );

  const totalRequestsCountAggregation = await ReservationRequestGroup.aggregate(
    [
      { $unwind: '$allBids' },
      {
        $match: {
          'allBids.serviceProviderCompany': serviceProviderCompanyObjectId,
        },
      },
      { $count: 'totalRequests' },
    ],
  );

  const totalRequestsCount =
    totalRequestsCountAggregation[0]?.totalRequests || 0;

  // const liveRequestsCount = await ReservationRequestGroup.countDocuments({
  //   'allBids.serviceProviderCompany': serviceProviderCompany._id,
  // });

  const liveRequestsCount = await ReservationRequestGroup.aggregate([
    {
      $match: {
        'allBids.serviceProviderCompany': serviceProviderCompanyObjectId,

        'biddingDate.startDate': { $exists: true, $lt: new Date() },
        $or: [
          { 'biddingDate.endDate': { $exists: false } },
          {
            $expr: {
              $and: [
                { $gt: ['$biddingDate.endDate', new Date()] },
                { $gt: ['$biddingDate.endDate', '$biddingDate.startDate'] },
              ],
            },
          },
        ],
      },
    },
    {
      $count: 'count',
    },
  ]);

  const liveCount =
    liveRequestsCount.length > 0 ? liveRequestsCount[0].count : 0;

  const bidedRequestsCountAggregation = await ReservationRequestGroup.aggregate(
    [
      { $unwind: '$allBids' },
      {
        $match: {
          'allBids.serviceProviderCompany': serviceProviderCompanyObjectId,
        },
      },
      { $count: 'bidedRequests' },
    ],
  );

  const bidedRequestsCount =
    bidedRequestsCountAggregation[0]?.bidedRequests || 0;

  const ongoingRequestsCount = await ReservationRequestGroup.countDocuments({
    'postBiddingProcess.serviceProviderCompany': serviceProviderCompanyObjectId,
    taskStatus: 'ongoing',
  });

  const completedRequestsCount = await ReservationRequestGroup.countDocuments({
    'postBiddingProcess.serviceProviderCompany': serviceProviderCompanyObjectId,
    taskStatus: 'completed',
  });

  const canceledRequestsCount = await ReservationRequestGroup.countDocuments({
    'postBiddingProcess.serviceProviderCompany': serviceProviderCompanyObjectId,
    //serviceProviderCompany._id
    taskStatus: 'canceled',
  });

  return {
    totalRequests: {
      count: totalRequestsCount,
      progress: null,
    },
    live: {
      count: liveCount,
      progress: null,
    },
    bided: {
      count: bidedRequestsCount,
      progress: null,
    },
    ongoing: {
      count: ongoingRequestsCount,
      progress: null,
    },
    completed: {
      count: completedRequestsCount,
      progress: null,
    },
    canceled: {
      count: canceledRequestsCount,
      progress: null,
    },
  };
};

export const reservationServices = {
  createReservationRequestIntoDB,
  reschedule,
  getMyReservationsService,
  getMyReservationsByStatusService,
  getReservationsByStatusService,
  getAllReservationsService,
  getAllReservationsCount,
  getAllReservationsByUser,
  getAllReservationsByServiceProviderCompany,
  getAllScheduledReservationsByServiceProviderCompany,
  getReservationCountByServiceProviderCompany,
  getSignedUrl,
  deleteReservation,
  getReservationRequestForServiceProviderCompany,
  getDashboardScreenAnalyzingForServiceProviderCompany,
};

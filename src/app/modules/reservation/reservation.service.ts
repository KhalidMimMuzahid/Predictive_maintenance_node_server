import S3 from 'aws-sdk/clients/s3';
// import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { Request } from 'express';
import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { TAuth } from '../../interface/error';
import { addDays } from '../../utils/addDays';
import { getLatLngBounds } from '../../utils/getLatLngBounds';
import { padNumberWithZeros } from '../../utils/padNumberWithZeros';
import { sortByCreatedAtDescending } from '../../utils/sortByCreatedAtDescending';
import { TInvoiceStatus } from '../invoice/invoice.interface';
import { Invoice } from '../invoice/invoice.model';
import { isEngineerBelongsToThisTeamByReservation } from '../invoice/invoice.utils';
import { Machine } from '../machine/machine.model';
import { predefinedValueServices } from '../predefinedValue/predefinedValue.service';
import { ReservationRequestGroup } from '../reservationGroup/reservationGroup.model';
import { ServiceProviderBranch } from '../serviceProviderBranch/serviceProviderBranch.model';
import { ServiceProviderCompany } from '../serviceProviderCompany/serviceProviderCompany.model';
import { TSubscriptionPurchased } from '../subscriptionPurchased/subscriptionPurchased.interface';
import {
  TMachineType,
  TMachineType2,
  TPeriod,
  TProblem,
  TReservationRequest,
  TReservationStatus,
  TReservationType,
  TSchedule,
} from './reservation.interface';
import { ReservationRequest } from './reservation.model';

const createReservationRequestIntoDB = async ({
  user,
  machine_id,
  problem,
  schedule,
  req,
}: {
  user: Types.ObjectId;
  machine_id: string;
  problem: TProblem;
  schedule: TSchedule;
  req: Request;
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

      // TODO:
      const nearestLocation =
        await predefinedValueServices.getReservationRequestNearestLocation();

      const radiusInKm = nearestLocation?.selectedRadius || 500; // if not set, then it will be applied

      const location = machineData?.usedFor?.address?.location;

      if (!location) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'this machine must have location',
        );
      }
      // console.log(location);
      // console.log({ ...location, radiusInKm });
      const { latitude, longitude } = getLatLngBounds({
        latitude: location?.latitude,
        longitude: location?.longitude,
        radiusInKm,
      });
      // console.log({ latitude, longitude });
      const serviceProviderBranches = await ServiceProviderBranch.find({
        'address.location.latitude': { $lt: latitude?.max, $gt: latitude?.min },
        'address.location.longitude': {
          $lt: longitude.max,
          $gt: longitude.min,
        },
      });

      await session.commitTransaction();
      await session.endSession();
      serviceProviderBranches?.forEach((branch) => {
        req.io.emit(branch?._id?.toString(), {
          data: reservationGroup,
          type: 'on-demand-raised',
        });
      });
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

const setReservationAsInvalid = async (reservationRequest: string) => {
  const updatedReservationRequest = await ReservationRequest.findByIdAndUpdate(
    reservationRequest,
    {
      isValid: false,
    },
  );

  if (!updatedReservationRequest) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'something went wrong, please try again',
    );
  }
  return null;
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

const getCompletedReservationRequestForServiceProviderCompany = async ({
  adminUserId,
  period,
  range,
  limit,
  page,
  status,
}: {
  adminUserId: mongoose.Types.ObjectId;
  period: TPeriod;
  range: number;
  limit: number;
  page: number;
  status: TInvoiceStatus;
}) => {
  const serviceProviderCompany = await ServiceProviderCompany.findOne({
    serviceProviderAdmin: adminUserId,
  });

  if (!serviceProviderCompany) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Service provider company not found for this user.',
    );
  }

  const matchQuery = {
    'postBiddingProcess.serviceProviderCompany': serviceProviderCompany._id,
    taskStatus: status,
  };

  const currentDate = new Date();
  let startDate: Date;
  let endDate: Date;

  if (period === 'weekly') {
    startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - range * 7);
    endDate = new Date(currentDate);
    endDate.setDate(currentDate.getDate() - (range - 1) * 7);
  } else if (period === 'monthly') {
    endDate = new Date(currentDate);
    startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - 30 * range);
    endDate.setDate(endDate.getDate() - 30 * (range - 1));
  } else if (period === 'yearly') {
    endDate = new Date(currentDate);
    startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - 365 * range);
    endDate.setDate(endDate.getDate() - 365 * (range - 1));
  }

  matchQuery['createdAt'] = { $gte: startDate, $lte: endDate };

  const totalRequests = await Invoice.countDocuments(matchQuery);

  const totalPages = Math.ceil(totalRequests / limit);

  const aggArray = [
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
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ];

  const result = await Invoice.aggregate(aggArray);

  return {
    requests: result,
    pagination: {
      totalRequests,
      currentPage: page,
      totalPages,
      pageSize: limit,
    },
  };
};

const getChartAnalyzing = async (
  adminUserId: mongoose.Types.ObjectId,
  targetYear?: number,
) => {
  // const serviceProviderCompany = await ServiceProviderCompany.findOne({
  //   serviceProviderAdmin: adminUserId,
  // });

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  let months;

  if (!targetYear || targetYear === currentYear) {
    months = Array.from({ length: 12 }, (_, i) => {
      const monthOffset = currentMonth - 1 - i;
      const year = monthOffset < 0 ? currentYear - 1 : currentYear;
      const month = ((monthOffset + 12) % 12) + 1;

      const startDateOfMonth = new Date(Date.UTC(year, month - 1, 1));
      const endDateOfMonth = new Date(
        Date.UTC(year, month, 0, 23, 59, 59, 999),
      );

      const monthName = startDateOfMonth.toLocaleString('en-US', {
        month: 'short',
      });
      const formattedMonth = `${monthName} ${year}`;

      return { month: formattedMonth, startDateOfMonth, endDateOfMonth };
    }).reverse();
  } else {
    months = Array.from({ length: 12 }, (_, i) => {
      const startDateOfMonth = new Date(Date.UTC(targetYear, i, 1));
      const endDateOfMonth = new Date(
        Date.UTC(targetYear, i + 1, 0, 23, 59, 59, 999),
      );

      const monthName = startDateOfMonth.toLocaleString('en-US', {
        month: 'short',
      });
      const formattedMonth = `${monthName} ${targetYear}`;

      return { month: formattedMonth, startDateOfMonth, endDateOfMonth };
    });
  }

  const requests = await Promise.all(
    months.map(async (month) => {
      const count = await ReservationRequest.countDocuments({
        //serviceProviderCompany,
        createdAt: {
          $gte: month.startDateOfMonth,
          $lte: month.endDateOfMonth,
        },
      });

      return { month: month.month, count };
    }),
  );

  return requests;
};

// const getTotalReservationForChart = async (
//   period: TPeriod,
//   kpiStatus1: TReservationStatus,
//   kpiStatus2: TReservationStatus,
// ) => {
//   let timeFrame;

//   // Logic for handling "monthly" period as the last 30/31 days from today
//   if (period === 'monthly') {
//     // Get today's date and calculate the date 30 days ago
//     const today = new Date();
//     const lastMonthStart = new Date();
//     lastMonthStart.setDate(today.getDate() - 30); // Subtract 30 days to get the start of the last 30 days

//     // Create the start and end dates with UTC time for the last 30 days
//     const startDateOfLast30Days = new Date(
//       Date.UTC(
//         lastMonthStart.getFullYear(),
//         lastMonthStart.getMonth(),
//         lastMonthStart.getDate(),
//       ),
//     );

//     const endDateOfLast30Days = new Date(
//       Date.UTC(
//         today.getFullYear(),
//         today.getMonth(),
//         today.getDate(),
//         23,
//         59,
//         59,
//         999, // Set the time to the end of the current day
//       ),
//     );

//     // Log the start and end dates of the last 30 days to the console
//     console.log('Start Date of Last 30 Days:', startDateOfLast30Days);
//     console.log('End Date of Last 30 Days:', endDateOfLast30Days);

//     // Set the time frame for the last 30 days
//     timeFrame = [
//       {
//         month: `Last 1 month`,
//         startDateOfMonth: startDateOfLast30Days,
//         endDateOfMonth: endDateOfLast30Days,
//       },
//     ];
//   } else if (period === 'weekly') {
//     // Get the last 7 days (including today)
//     const today = new Date();
//     const last7Days = Array.from({ length: 7 }, (_, i) => {
//       const day = new Date();
//       day.setDate(today.getDate() - i);
//       const formattedDate = day.toLocaleDateString('en-US', {
//         weekday: 'short',
//         month: 'short',
//         day: 'numeric',
//       });

//       return {
//         day: formattedDate,
//         startOfDay: new Date(day.setHours(0, 0, 0, 0)),
//         endOfDay: new Date(day.setHours(23, 59, 59, 999)),
//       };
//     }).reverse();

//     timeFrame = last7Days.map((time) => ({
//       week: time.day,
//       startOfWeek: time.startOfDay,
//       endOfWeek: time.endOfDay,
//     }));
//   } else if (period === 'yearly') {
//     // Your existing yearly logic, kept as-is
//     const currentYear = new Date().getFullYear();
//     const currentMonth = new Date().getMonth() + 1;

//     timeFrame = Array.from({ length: 12 }, (_, i) => {
//       const monthOffset = currentMonth - 1 - i;
//       const year = monthOffset < 0 ? currentYear - 1 : currentYear;
//       const month = ((monthOffset + 12) % 12) + 1;

//       const startDateOfMonth = new Date(Date.UTC(year, month - 1, 1));
//       const endDateOfMonth = new Date(
//         Date.UTC(year, month, 0, 23, 59, 59, 999),
//       );

//       const monthName = startDateOfMonth.toLocaleString('en-US', {
//         month: 'short',
//       });
//       const formattedMonth = `${monthName} ${year}`;

//       return { month: formattedMonth, startDateOfMonth, endDateOfMonth };
//     }).reverse();
//   }

//   // Count documents based on the selected period (weekly, monthly, yearly)
//   const requests = await Promise.all(
//     timeFrame.map(async (time) => {
//       let status1Count = 0; // Count for kpiStatus1
//       let status2Count = 0; // Count for kpiStatus2

//       if (period === 'monthly') {
//         status1Count = await ReservationRequest.countDocuments({
//           createdAt: {
//             $gte: time.startDateOfMonth,
//             $lte: time.endDateOfMonth,
//           },
//           status: kpiStatus1,
//         });
//         status2Count = await ReservationRequest.countDocuments({
//           createdAt: {
//             $gte: time.startDateOfMonth,
//             $lte: time.endDateOfMonth,
//           },
//           status: kpiStatus2,
//         });

//         return {
//           period: time.month, // "Last 30 Days"
//           [kpiStatus1]: status1Count,
//           [kpiStatus2]: status2Count,
//         };
//       } else if (period === 'weekly') {
//         status1Count = await ReservationRequest.countDocuments({
//           createdAt: {
//             $gte: time.startOfWeek,
//             $lte: time.endOfWeek,
//           },
//           status: kpiStatus1,
//         });
//         status2Count = await ReservationRequest.countDocuments({
//           createdAt: {
//             $gte: time.startOfWeek,
//             $lte: time.endOfWeek,
//           },
//           status: kpiStatus2,
//         });

//         return {
//           period: time.week, // Week number or day number
//           [kpiStatus1]: status1Count,
//           [kpiStatus2]: status2Count,
//         };
//       } else if (period === 'yearly') {
//         status1Count = await ReservationRequest.countDocuments({
//           createdAt: {
//             $gte: time.startDateOfMonth,
//             $lte: time.endDateOfMonth,
//           },
//           status: kpiStatus1,
//         });
//         status2Count = await ReservationRequest.countDocuments({
//           createdAt: {
//             $gte: time.startDateOfMonth,
//             $lte: time.endDateOfMonth,
//           },
//           status: kpiStatus2,
//         });

//         return {
//           period: time.month, // Formatted month and year
//           [kpiStatus1]: status1Count,
//           [kpiStatus2]: status2Count,
//         };
//       }
//     }),
//   );

//   // Filter out any undefined entries if they exist
//   const filteredRequests = requests.filter((req) => req !== undefined);

//   return {
//     success: true,
//     message: 'Completed reservation requests retrieved successfully',
//     data: filteredRequests,
//   };
// };

// const getTotalReservationForChart = async (
//   period: TPeriod,
//   kpiStatus1: TReservationStatus,
//   kpiStatus2: TReservationStatus,
// ) => {
//   let timeFrame;

//   if (period === 'monthly') {
//     const today = new Date();
//     const lastMonthStart = new Date();
//     lastMonthStart.setDate(today.getDate() - 30);

//     const startDateOfLast30Days = new Date(
//       Date.UTC(
//         lastMonthStart.getFullYear(),
//         lastMonthStart.getMonth(),
//         lastMonthStart.getDate(),
//       ),
//     );

//     const endDateOfLast30Days = new Date(
//       Date.UTC(
//         today.getFullYear(),
//         today.getMonth(),
//         today.getDate(),
//         23,
//         59,
//         59,
//         999,
//       ),
//     );

//     timeFrame = [
//       {
//         month: `Last 1 month`,
//         startDateOfMonth: startDateOfLast30Days,
//         endDateOfMonth: endDateOfLast30Days,
//       },
//     ];
//   }

//   // if (period === 'monthly') {
//   //   const today = new Date();

//   //   // Set to the first day of the current month
//   //   const currentMonthStart = new Date(
//   //     today.getFullYear(),
//   //     today.getMonth(),
//   //     1,
//   //   );

//   //   // Subtract one day from current month start to get the last day of the previous month
//   //   const lastMonthEnd = new Date(currentMonthStart.getTime() - 1);

//   //   // Get the first day of the previous month
//   //   const lastMonthStart = new Date(
//   //     lastMonthEnd.getFullYear(),
//   //     lastMonthEnd.getMonth(),
//   //     1,
//   //   );

//   //   const startDateOfLastMonth = new Date(
//   //     Date.UTC(
//   //       lastMonthStart.getFullYear(),
//   //       lastMonthStart.getMonth(),
//   //       lastMonthStart.getDate(),
//   //     ),
//   //   );

//   //   const endDateOfLastMonth = new Date(
//   //     Date.UTC(
//   //       lastMonthEnd.getFullYear(),
//   //       lastMonthEnd.getMonth(),
//   //       lastMonthEnd.getDate(),
//   //       23,
//   //       59,
//   //       59,
//   //       999,
//   //     ),
//   //   );

//   //   timeFrame = [
//   //     {
//   //       month: `Last full month`,
//   //       startDateOfMonth: startDateOfLastMonth,
//   //       endDateOfMonth: endDateOfLastMonth,
//   //     },
//   //   ];
//   // }
//   else if (period === 'weekly') {
//     // Calculate the start date of the last 7 days (including today)
//     const today = new Date();
//     const lastWeekStart = new Date();
//     lastWeekStart.setDate(today.getDate() - 6); // Subtract 6 to include today in the last 7 days

//     const startDateOfLast7Days = new Date(
//       Date.UTC(
//         lastWeekStart.getFullYear(),
//         lastWeekStart.getMonth(),
//         lastWeekStart.getDate(),
//       ),
//     );

//     const endDateOfLast7Days = new Date(
//       Date.UTC(
//         today.getFullYear(),
//         today.getMonth(),
//         today.getDate(),
//         23,
//         59,
//         59,
//         999,
//       ),
//     );

//     // Set the time frame for the last 7 days
//     timeFrame = [
//       {
//         week: `Last 7 days`,
//         startDateOfWeek: startDateOfLast7Days,
//         endDateOfWeek: endDateOfLast7Days,
//       },
//     ];
//   } else if (period === 'yearly') {
//     const currentYear = new Date().getFullYear();
//     const currentMonth = new Date().getMonth() + 1;

//     timeFrame = Array.from({ length: 12 }, (_, i) => {
//       const monthOffset = currentMonth - 1 - i;
//       const year = monthOffset < 0 ? currentYear - 1 : currentYear;
//       const month = ((monthOffset + 12) % 12) + 1;

//       const startDateOfMonth = new Date(Date.UTC(year, month - 1, 1));
//       const endDateOfMonth = new Date(
//         Date.UTC(year, month, 0, 23, 59, 59, 999),
//       );

//       const monthName = startDateOfMonth.toLocaleString('en-US', {
//         month: 'short',
//       });
//       const formattedMonth = `${monthName} ${year}`;

//       return { month: formattedMonth, startDateOfMonth, endDateOfMonth };
//     }).reverse();
//   }

//   // Count documents based on the selected period (weekly, monthly, yearly)
//   const requests = await Promise.all(
//     timeFrame.map(async (time) => {
//       let status1Count = 0;
//       let status2Count = 0;

//       if (period === 'monthly') {
//         status1Count = await ReservationRequest.countDocuments({
//           createdAt: {
//             $gte: time.startDateOfMonth,
//             $lte: time.endDateOfMonth,
//           },
//           status: kpiStatus1,
//         });
//         status2Count = await ReservationRequest.countDocuments({
//           createdAt: {
//             $gte: time.startDateOfMonth,
//             $lte: time.endDateOfMonth,
//           },
//           status: kpiStatus2,
//         });

//         return {
//           period: time.month, // "Last 30 Days"
//           [kpiStatus1]: status1Count,
//           [kpiStatus2]: status2Count,
//         };
//       } else if (period === 'weekly') {
//         status1Count = await ReservationRequest.countDocuments({
//           createdAt: {
//             $gte: time.startDateOfWeek,
//             $lte: time.endDateOfWeek,
//           },
//           status: kpiStatus1,
//         });
//         status2Count = await ReservationRequest.countDocuments({
//           createdAt: {
//             $gte: time.startDateOfWeek,
//             $lte: time.endDateOfWeek,
//           },
//           status: kpiStatus2,
//         });

//         return {
//           period: time.week, // "Last 7 days"
//           [kpiStatus1]: status1Count,
//           [kpiStatus2]: status2Count,
//         };
//       } else if (period === 'yearly') {
//         status1Count = await ReservationRequest.countDocuments({
//           createdAt: {
//             $gte: time.startDateOfMonth,
//             $lte: time.endDateOfMonth,
//           },
//           status: kpiStatus1,
//         });
//         status2Count = await ReservationRequest.countDocuments({
//           createdAt: {
//             $gte: time.startDateOfMonth,
//             $lte: time.endDateOfMonth,
//           },
//           status: kpiStatus2,
//         });

//         return {
//           period: time.month, // Formatted month and year
//           [kpiStatus1]: status1Count,
//           [kpiStatus2]: status2Count,
//         };
//       }
//     }),
//   );

//   return requests.filter((req) => req !== undefined);
// };

const getTotalReservationForChart = async (
  period: TPeriod,
  kpiStatus1: TReservationStatus,
  kpiStatus2: TReservationStatus,
) => {
  let timeFrame;

  if (period === 'monthly') {
    const today = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const formattedDate = day.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      return {
        period: formattedDate,
        startOfDay: new Date(day.setHours(0, 0, 0, 0)),
        endOfDay: new Date(day.setHours(23, 59, 59, 999)),
      };
    }).reverse();

    timeFrame = last30Days.map((time) => ({
      period: time.period,
      startOfDay: time.startOfDay,
      endOfDay: time.endOfDay,
    }));
  } else if (period === 'weekly') {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const formattedDate = day.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      return {
        period: formattedDate,
        startOfDay: new Date(day.setHours(0, 0, 0, 0)),
        endOfDay: new Date(day.setHours(23, 59, 59, 999)),
      };
    }).reverse();
    timeFrame = last7Days;
  } else if (period === 'yearly') {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    timeFrame = Array.from({ length: 12 }, (_, i) => {
      const monthOffset = currentMonth - 1 - i;
      const year = monthOffset < 0 ? currentYear - 1 : currentYear;
      const month = ((monthOffset + 12) % 12) + 1;

      const startOfDay = new Date(Date.UTC(year, month - 1, 1));
      const endOfDay = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

      const monthName = startOfDay.toLocaleString('en-US', { month: 'short' });
      const formattedMonth = `${monthName} ${year}`;

      return { period: formattedMonth, startOfDay, endOfDay };
    }).reverse();
  }

  const requests = await Promise.all(
    timeFrame.map(async (time) => {
      const status1Count = await ReservationRequest.countDocuments({
        createdAt: {
          $gte: time.startOfDay,
          $lte: time.endOfDay,
        },
        status: kpiStatus1,
      });

      const status2Count = await ReservationRequest.countDocuments({
        createdAt: {
          $gte: time.startOfDay,
          $lte: time.endOfDay,
        },
        status: kpiStatus2,
      });

      return {
        period: time.period,
        [kpiStatus1]: status1Count,
        [kpiStatus2]: status2Count,
      };
    }),
  );

  return requests.filter((req) => req !== undefined);
};

const generateProgressReservationInPercentage = async () => {
  const today = new Date();
  const last30DaysAgo = new Date();
  last30DaysAgo.setDate(today.getDate() - 30);

  console.log("Today's date:", today);
  console.log('Date 30 days ago:', last30DaysAgo);

  const totalReservations = await ReservationRequest.countDocuments({
    createdAt: { $gte: last30DaysAgo, $lte: today },
  });

  const totalOnDemandReservations = await ReservationRequest.countDocuments({
    'schedule.category': 'on-demand',
    createdAt: { $gte: last30DaysAgo, $lte: today },
  });

  const totalAcceptedReservations = await ReservationRequest.countDocuments({
    status: 'accepted',
    createdAt: { $gte: last30DaysAgo, $lte: today },
  });

  const totalOngoingReservations = await ReservationRequest.countDocuments({
    status: 'ongoing',
    createdAt: { $gte: last30DaysAgo, $lte: today },
  });

  const totalCompletedReservations = await ReservationRequest.countDocuments({
    status: 'completed',
    createdAt: { $gte: last30DaysAgo, $lte: today },
  });

  const totalCanceledReservations = await ReservationRequest.countDocuments({
    status: 'canceled',
    createdAt: { $gte: last30DaysAgo, $lte: today },
  });

  const calculatePercentage = (partial: number, total: number): number => {
    return total > 0 ? (partial / total) * 100 : 0;
  };

  const onDemandProgressPercentage = calculatePercentage(
    totalOnDemandReservations,
    totalReservations,
  );

  const acceptedProgressPercentage = calculatePercentage(
    totalAcceptedReservations,
    totalReservations,
  );

  const ongoingProgressPercentage = calculatePercentage(
    totalOngoingReservations,
    totalReservations,
  );

  const completedProgressPercentage = calculatePercentage(
    totalCompletedReservations,
    totalReservations,
  );

  const canceledProgressPercentage = calculatePercentage(
    totalCanceledReservations,
    totalReservations,
  );

  return {
    totalReservations,
    onDemand: {
      total: totalOnDemandReservations,
      progressPercentage: onDemandProgressPercentage,
    },
    accepted: {
      total: totalAcceptedReservations,
      progressPercentage: acceptedProgressPercentage,
    },
    ongoing: {
      total: totalOngoingReservations,
      progressPercentage: ongoingProgressPercentage,
    },
    completed: {
      total: totalCompletedReservations,
      progressPercentage: completedProgressPercentage,
    },
    canceled: {
      total: totalCanceledReservations,
      progressPercentage: canceledProgressPercentage,
    },
  };
};
const getReservationRequestByReservationId = async (reservationId: string) => {
  if (!Types.ObjectId.isValid(reservationId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid reservation ID.');
  }

  const reservation = await ReservationRequest.findById(reservationId);

  return reservation;
};
export const reservationServices = {
  createReservationRequestIntoDB,
  setReservationAsInvalid,
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
  getCompletedReservationRequestForServiceProviderCompany,
  getChartAnalyzing,
  getTotalReservationForChart,
  generateProgressReservationInPercentage,
  getReservationRequestByReservationId,
};

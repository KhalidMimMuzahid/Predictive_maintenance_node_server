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
import { countLifeCycle } from './reservation.utils';

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

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
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
            taskStatus: 'pending',
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

      await countLifeCycle({ machineData, session });
      // TODO: for sending notification to the branch
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
        'address.location.latitude': {
          $lt: latitude?.max,
          $gt: latitude?.min,
        },
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
    }
    // const result = await ReservationRequest.create(reservationRequest);
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

    await countLifeCycle({ machineData, session });

    await session.commitTransaction();
    await session.endSession();
    return createdReservationRequest;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
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

// const getReservationCountByServiceProviderCompany = async (
//   serviceProviderCompany: string,
// ) => {
//   const orderReceivedReservationsCount = await Invoice.countDocuments({
//     'postBiddingProcess.serviceProviderCompany': new mongoose.Types.ObjectId(
//       serviceProviderCompany,
//     ),
//   });
//   const orderCompletedReservationsCount = await Invoice.countDocuments({
//     'postBiddingProcess.serviceProviderCompany': new mongoose.Types.ObjectId(
//       serviceProviderCompany,
//     ),
//     taskStatus: 'completed',
//   });
//   const orderCanceledReservationsCount = await Invoice.countDocuments({
//     'postBiddingProcess.serviceProviderCompany': new mongoose.Types.ObjectId(
//       serviceProviderCompany,
//     ),
//     taskStatus: 'canceled',
//   });
//   return {
//     orderReceivedReservationsCount,
//     orderCompletedReservationsCount,
//     orderCanceledReservationsCount,
//   };
// };

// const getReservationCountByServiceProviderCompany = async (
//   serviceProviderCompany: string,
//   orderType?: TInvoiceStatus,
//   //orderType?: string,
// ) => {
//   const filterQuery = {
//     'postBiddingProcess.serviceProviderCompany': new mongoose.Types.ObjectId(
//       serviceProviderCompany,
//     ),
//   };

//   if (!orderType) {
//     const orderReceivedReservationsCount =
//       await Invoice.countDocuments(filterQuery);
//     return { orderReceivedReservationsCount };
//   } else if (orderType === 'completed') {
//     const orderCompletedReservationsCount = await Invoice.countDocuments({
//       ...filterQuery,
//       taskStatus: 'completed',
//     });
//     return { orderCompletedReservationsCount };
//   } else if (orderType === 'canceled') {
//     const orderCanceledReservationsCount = await Invoice.countDocuments({
//       ...filterQuery,
//       taskStatus: 'canceled',
//     });
//     return { orderCanceledReservationsCount };
//   }
// };

const getReservationCountByServiceProviderCompany = async (
  serviceProviderCompany: string,
  orderType?: TInvoiceStatus,
) => {
  // const filterQuery = {
  //   'postBiddingProcess.serviceProviderCompany': new mongoose.Types.ObjectId(serviceProviderCompany),
  // };

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterQuery: any = {};
  filterQuery['postBiddingProcess.serviceProviderCompany'] =
    new mongoose.Types.ObjectId(serviceProviderCompany);

  if (!orderType) {
    const orderReceivedReservationsCount =
      await Invoice.countDocuments(filterQuery);
    return { orderReceivedReservationsCount };
  } else if (orderType === 'completed') {
    const orderCompletedReservationsCount = await Invoice.countDocuments({
      ...filterQuery,
      taskStatus: 'completed',
    });
    return { orderCompletedReservationsCount };
  } else if (orderType === 'canceled') {
    const orderCanceledReservationsCount = await Invoice.countDocuments({
      ...filterQuery,
      taskStatus: 'canceled',
    });
    return { orderCanceledReservationsCount };
  }
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

const getTotalReservationForChart = async (
  period: TPeriod,
  kpiStatus1: TReservationStatus,
  kpiStatus2: TReservationStatus,
) => {
  // Check if both KPI statuses are the same
  if (kpiStatus1 === kpiStatus2) {
    throw new Error('kpiStatus1 and kpiStatus2 cannot be the same.');
  }

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

  const last30DaysAgo = new Date(today);
  last30DaysAgo.setDate(today.getDate() - 30);

  const secondLast30DaysAgo = new Date(last30DaysAgo);
  secondLast30DaysAgo.setDate(last30DaysAgo.getDate() - 30);

  const last30DaysResults = await ReservationRequest.aggregate([
    {
      $match: {
        createdAt: { $gte: last30DaysAgo, $lte: today },
      },
    },
    {
      $group: {
        _id: null,
        totalReservations: { $sum: 1 },
        totalOnDemandReservations: {
          $sum: {
            $cond: [{ $eq: ['$schedule.category', 'on-demand'] }, 1, 0],
          },
        },
        totalAcceptedReservations: {
          $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] },
        },
        totalOngoingReservations: {
          $sum: { $cond: [{ $eq: ['$status', 'ongoing'] }, 1, 0] },
        },
        totalCompletedReservations: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        totalCanceledReservations: {
          $sum: { $cond: [{ $eq: ['$status', 'canceled'] }, 1, 0] },
        },
      },
    },
  ]);

  const secondLast30DaysResults = await ReservationRequest.aggregate([
    {
      $match: {
        createdAt: { $gte: secondLast30DaysAgo, $lte: last30DaysAgo },
      },
    },
    {
      $group: {
        _id: null,
        totalReservations: { $sum: 1 },
        totalOnDemandReservations: {
          $sum: {
            $cond: [{ $eq: ['$schedule.category', 'on-demand'] }, 1, 0],
          },
        },
        totalAcceptedReservations: {
          $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] },
        },
        totalOngoingReservations: {
          $sum: { $cond: [{ $eq: ['$status', 'ongoing'] }, 1, 0] },
        },
        totalCompletedReservations: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        totalCanceledReservations: {
          $sum: { $cond: [{ $eq: ['$status', 'canceled'] }, 1, 0] },
        },
      },
    },
  ]);

  const last30DaysData = last30DaysResults[0] || {};
  const secondLast30DaysData = secondLast30DaysResults[0] || {};

  const calculatePercentageProgress = (
    last30DaysValue: number,
    secondLast30DaysValue: number,
  ): number => {
    if (secondLast30DaysValue === 0) {
      return last30DaysValue > 0 ? 100 : 0; // If no previous data, it's either 100% increase or no change.
    }
    return (
      ((last30DaysValue - secondLast30DaysValue) / secondLast30DaysValue) * 100
    );
  };

  const totalReservationsCount =
    (last30DaysData.totalReservations || 0) +
    (secondLast30DaysData.totalReservations || 0);
  const totalReservationProgress = calculatePercentageProgress(
    last30DaysData.totalReservations || 0,
    secondLast30DaysData.totalReservations || 0,
  );

  const totalOnDemandCount =
    (last30DaysData.totalOnDemandReservations || 0) +
    (secondLast30DaysData.totalOnDemandReservations || 0);
  const onDemandReservationProgress = calculatePercentageProgress(
    last30DaysData.totalOnDemandReservations || 0,
    secondLast30DaysData.totalOnDemandReservations || 0,
  );

  const totalAcceptedCount =
    (last30DaysData.totalAcceptedReservations || 0) +
    (secondLast30DaysData.totalAcceptedReservations || 0);
  const acceptedReservationProgress = calculatePercentageProgress(
    last30DaysData.totalAcceptedReservations || 0,
    secondLast30DaysData.totalAcceptedReservations || 0,
  );

  const totalOngoingCount =
    (last30DaysData.totalOngoingReservations || 0) +
    (secondLast30DaysData.totalOngoingReservations || 0);
  const ongoingReservationProgress = calculatePercentageProgress(
    last30DaysData.totalOngoingReservations || 0,
    secondLast30DaysData.totalOngoingReservations || 0,
  );

  const totalCompletedCount =
    (last30DaysData.totalCompletedReservations || 0) +
    (secondLast30DaysData.totalCompletedReservations || 0);
  const completedReservationProgress = calculatePercentageProgress(
    last30DaysData.totalCompletedReservations || 0,
    secondLast30DaysData.totalCompletedReservations || 0,
  );

  const totalCanceledCount =
    (last30DaysData.totalCanceledReservations || 0) +
    (secondLast30DaysData.totalCanceledReservations || 0);
  const canceledReservationProgress = calculatePercentageProgress(
    last30DaysData.totalCanceledReservations || 0,
    secondLast30DaysData.totalCanceledReservations || 0,
  );

  return {
    totalReservations: {
      totalCount: totalReservationsCount,
      progressPercentage: totalReservationProgress,
    },
    onDemand: {
      totalOnDemand: totalOnDemandCount,
      progressPercentage: onDemandReservationProgress,
    },
    accepted: {
      totalAccepted: totalAcceptedCount,
      progressPercentage: acceptedReservationProgress,
    },
    ongoing: {
      totalOngoing: totalOngoingCount,
      progressPercentage: ongoingReservationProgress,
    },
    completed: {
      totalCompleted: totalCompletedCount,
      progressPercentage: completedReservationProgress,
    },
    canceled: {
      totalCanceled: totalCanceledCount,
      progressPercentage: canceledReservationProgress,
    },
  };
};

const getReservationRequestByReservationId = async (reservationId: string) => {
  const reservation = await ReservationRequest.findById(reservationId);
  if (!reservation) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reservation not found.');
  }
  return reservation;
};

const getAllOngoingResByBranch = async (serviceProviderBranch: string) => {
  const result = await Invoice.aggregate([
    {
      $match: {
        'postBiddingProcess.serviceProviderBranch': new mongoose.Types.ObjectId(
          serviceProviderBranch,
        ),
        taskStatus: 'ongoing',
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
      $replaceRoot: {
        newRoot: '$reservationRequest',
      },
    },
  ]);
  return result;
};
const getAllRescheduledResByBranch = async (serviceProviderBranch: string) => {
  const result = await Invoice.aggregate([
    {
      $match: {
        'postBiddingProcess.serviceProviderBranch': new Types.ObjectId(
          serviceProviderBranch,
        ),
        taskStatus: 'ongoing',
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
  ]);
  return result;
};
const getAllCompletedResByBranch = async (serviceProviderBranch: string) => {
  const result = await Invoice.aggregate([
    {
      $match: {
        'postBiddingProcess.serviceProviderBranch': new mongoose.Types.ObjectId(
          serviceProviderBranch,
        ),
        taskStatus: 'completed',
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
      $replaceRoot: {
        newRoot: '$reservationRequest',
      },
    },
  ]);
  return result;
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
  getAllOngoingResByBranch,
  getAllRescheduledResByBranch,
  getAllCompletedResByBranch,
};

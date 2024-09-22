import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { padNumberWithZeros } from '../../utils/padNumberWithZeros';
import { TMachineType } from '../reservation/reservation.interface';
import { ReservationRequest } from '../reservation/reservation.model';
import { ServiceProviderBranch } from '../serviceProviderBranch/serviceProviderBranch.model';
import { ServiceProviderCompany } from '../serviceProviderCompany/serviceProviderCompany.model';
import { TRole } from '../user/user.interface';
import { userServices } from '../user/user.service';
import { ServiceProviderAdmin } from '../user/usersModule/serviceProviderAdmin/serviceProviderAdmin.model';
import {
  TBiddingDate,
  TPostBiddingProcess,
  TReservationGroupType,
} from './reservationGroup.interface';
import { ReservationRequestGroup } from './reservationGroup.model';
import { TAuth } from '../../interface/error';
import { ServiceProviderBranchManager } from '../user/usersModule/branchManager/branchManager.model';

const createReservationRequestGroup = async ({
  reservationRequests,
  groupName,
  biddingDate: biddingDateString,
}: {
  reservationRequests: string[];
  groupName: string;
  biddingDate: Partial<TBiddingDate>;
}) => {
  const session = await mongoose.startSession();

  // const biddingDate = {
  //   startDate: isNaN(
  //     new Date(biddingDateString?.startDate) as unknown as number,
  //   )
  //     ? undefined
  //     : new Date(biddingDateString?.startDate),
  //   endDate: isNaN(new Date(biddingDateString?.endDate) as unknown as number)
  //     ? undefined
  //     : new Date(biddingDateString?.endDate),
  // };
  // // const biddingDate3 = {
  // //   biddingDate2
  // // }
  // // console.log(biddingDate2);
  // return biddingDate;

  try {
    session.startTransaction();
    const reservations = await ReservationRequest.find()
      // .populate({
      //   path: 'machine',
      //   select: 'sensorModulesAttached',
      //   options: { strictPopulate: false },
      // })
      .where('_id')
      .in(reservationRequests)
      .session(session);

    if (
      reservations?.length !== reservationRequests.length ||
      reservationRequests.length === 0
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Some of the ids provided do not have an associated reservation request',
      );
    }

    const groupForMachineType: TMachineType = reservations[0]?.isSensorConnected
      ? 'connected'
      : 'non-connected';

    reservations?.forEach((reservation) => {
      if (reservation?.schedule?.category === 'on-demand') {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'on-demand reservation request can not be grouped',
        );
      }

      if (reservation.reservationRequestGroup) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Some of the reservation you provided has already been grouped',
        );
      }

      const groupForMachineType2: TMachineType = reservation?.isSensorConnected
        ? 'connected'
        : 'non-connected';

      if (groupForMachineType !== groupForMachineType2) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Reservation Group cannot have different type of reservation',
        );
      }
    });

    // return 'under construction';

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
          reservationRequests: reservationRequests.map(
            (each) => new mongoose.Types.ObjectId(each),
          ),
          groupForMachineType,
          groupId: groupId,
          groupName: groupName,

          biddingDate: {
            startDate: isNaN(
              new Date(biddingDateString?.startDate) as unknown as number,
            )
              ? undefined
              : new Date(biddingDateString?.startDate),
            endDate: isNaN(
              new Date(biddingDateString?.endDate) as unknown as number,
            )
              ? undefined
              : new Date(biddingDateString?.endDate),
          },
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

    // reservations.forEach(async (reservation) => {
    //   reservation.reservationRequestGroup = reservationGroup?._id;
    //   const updatedReservation = await reservation.save();

    //   console.log({ updatedReservation });
    // });

    // Or,

    // await Promise.all(
    //   reservations.map(async (reservation) => {
    //     reservation.reservationRequestGroup = reservationGroup?._id;
    //     await reservation.save();
    //   }),
    // );
    // Or,
    const updatedReservations = await ReservationRequest.updateMany(
      { _id: { $in: reservationRequests } },
      { reservationRequestGroup: reservationGroup?._id },
      { session: session },
    );

    if (updatedReservations?.modifiedCount !== reservations?.length) {
      if (!reservationGroupArray?.length) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'failed to create reservation group',
        );
      }
    }
    await session.commitTransaction();
    await session.endSession();

    return reservationGroup;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

// biddingUser: Types.ObjectId; // ObjectId of User model; who actually bidding this reservation (service provider admin or sub admin)
// serviceProviderCompany

const allReservationsGroup = async ({
  groupForMachineType,
  reservationGroupType,
}: {
  groupForMachineType: TMachineType;
  reservationGroupType: TReservationGroupType;
}) => {
  // -------------------************----------------------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterQuery: any = {
    $and: [
      {
        groupForMachineType,
        isOnDemand: false,
      },
    ],
  };

  if (reservationGroupType === 'all') {
    // do nothing
  } else if (reservationGroupType === 'pending') {
    //

    filterQuery?.$and.push({
      $or: [
        { 'postBiddingProcess.serviceProviderCompany': { $exists: false } },
        { 'postBiddingProcess.serviceProviderCompany': null },
      ],
    });
    filterQuery?.$and.push({
      $or: [
        { 'biddingDate.endDate': { $exists: false } },
        { 'biddingDate.endDate': { $gt: new Date() } },
      ],
    });
  } else if (reservationGroupType === 'bid-closed-group') {
    filterQuery?.$and.push({
      $or: [
        { 'postBiddingProcess.serviceProviderCompany': { $exists: false } },
        { 'postBiddingProcess.serviceProviderCompany': null },
      ],
    });
    filterQuery?.$and.push({
      $and: [
        { 'biddingDate.endDate': { $exists: true } },
        { 'biddingDate.endDate': { $lt: new Date() } },
      ],
    });
  } else if (reservationGroupType === 'assigned-to-company') {
    filterQuery?.$and.push({
      $and: [
        {
          'postBiddingProcess.serviceProviderCompany': {
            $exists: true,
            $ne: null,
          },
        },
        {
          taskStatus: {
            $or: {
              $exists: false,
              $eq: null,
            },
          },
        },
      ],
    });
  } else if (reservationGroupType === 'ongoing') {
    filterQuery?.$and.push({
      taskStatus: 'ongoing',
    });
    //
  } else if (reservationGroupType === 'completed') {
    //

    filterQuery?.$and.push({
      taskStatus: 'completed',
    });
  } else if (reservationGroupType === 'canceled') {
    filterQuery?.$and.push({
      taskStatus: 'canceled',
    });
  }

  // ----------------*************-----------------------
  // reservationRequests
  const result = await ReservationRequestGroup.find(filterQuery)
    .select(
      'user groupId groupName taskStatus biddingDate allBids postBiddingProcess',
    )
    .populate([
      {
        path: 'reservationRequests',
        select: 'status machineType invoice schedule problem',
        populate: {
          path: 'user',
          select: 'phone showaUser email',
          populate: {
            path: 'showaUser',
            select: 'name addresses photoUrl',
            options: { strictPopulate: false },
          },

          options: { strictPopulate: false },
        },
      },
      // postBiddingProcess.invoiceGroup
      // postBiddingProcess.serviceProviderCompany

      {
        path: 'postBiddingProcess.serviceProviderCompany',
        select: 'companyName photoUrl',
        options: { strictPopulate: false },
      },
      {
        path: 'allBids.serviceProviderCompany',
        select: 'status companyName photoUrl',
        options: { strictPopulate: false },
      },
      // {
      //   path: 'allBids.serviceProviderCompany',
      //   options: { strictPopulate: false },
      // },
    ]);
  const reservationGroups = result?.map((each) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reservationGroup: any = { ...each };
    if (!each?.taskStatus) {
      if (
        !each?.postBiddingProcess?.serviceProviderCompany &&
        (!each?.biddingDate?.endDate || each?.biddingDate?.endDate > new Date())
      ) {
        // its 'pending'
        reservationGroup._doc.taskStatus = 'pending';
      } else if (
        !each?.postBiddingProcess?.serviceProviderCompany &&
        (each?.biddingDate?.endDate || each?.biddingDate?.endDate < new Date())
      ) {
        reservationGroup._doc.taskStatus = 'bid-closed';
      } else if (
        each?.postBiddingProcess?.serviceProviderCompany &&
        !each?.taskStatus
      ) {
        reservationGroup._doc.taskStatus = 'assigned-to-company';
      }
    }

    return reservationGroup?._doc;
  });

  return reservationGroups;
};
const addBid = async ({
  reservationRequestGroup_id,
  biddingUser,
  biddingAmount,
  role,
}: {
  reservationRequestGroup_id: string;
  biddingUser: mongoose.Types.ObjectId;
  biddingAmount: number;
  role: TRole;
}) => {
  const resGroup = await ReservationRequestGroup.findById(
    new mongoose.Types.ObjectId(reservationRequestGroup_id),
  );
  if (!resGroup) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No reservation request group with this id',
    );
  }
  if (resGroup?.isOnDemand === true) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can not bid a On-demand reservation request group',
    );
  }

  if (
    !resGroup?.biddingDate?.startDate ||
    new Date() < resGroup?.biddingDate?.startDate ||
    (resGroup?.biddingDate?.endDate
      ? new Date() > resGroup?.biddingDate?.endDate
      : false)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can not bid a now. It is not bidding time for this reservation group',
    );
  }

  let serviceProviderCompany;
  if (role === 'serviceProviderAdmin') {
    const serviceProviderAdmin = await ServiceProviderAdmin.findOne({
      user: biddingUser,
    });
    if (!serviceProviderAdmin?.serviceProviderCompany) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You have not any information about service provider company',
      );
    }

    serviceProviderCompany = serviceProviderAdmin?.serviceProviderCompany;
  } else if (role === 'serviceProviderSubAdmin') {
    // find service provider company
  }
  const bid = { biddingUser, biddingAmount, serviceProviderCompany };
  {
    // resGroup.allBids.push(bid);
    // const updatedResGroup = await resGroup.save();
    // let indexOfThisCompanyBidding: number;
    // try {
    //   indexOfThisCompanyBidding = resGroup?.allBids?.findIndex(
    //     (eachBid) =>
    //       eachBid?.serviceProviderCompany?.toString() ===
    //       serviceProviderCompany?.toString(),
    //   ) as number;
    // } catch (error) {
    //   indexOfThisCompanyBidding = -1;
    // }
    // if (indexOfThisCompanyBidding === -1) {
    //   resGroup?.allBids?.push(bid);
    // } else {
    //   resGroup.allBids[indexOfThisCompanyBidding].biddingAmount = biddingAmount;
    //   resGroup.allBids[indexOfThisCompanyBidding].biddingUser = biddingUser;
    // }
    // console.log({ indexOfThisCompanyBidding });
    // resGroup.save();
  }
  const updatedReservationRequestGroup =
    await ReservationRequestGroup.findByIdAndUpdate(
      new mongoose.Types.ObjectId(reservationRequestGroup_id),
      { $push: { allBids: bid } },
      { new: true },
    );
  return updatedReservationRequestGroup;
};

const setBiddingDate = async ({
  reservationRequestGroup_id,
  biddingDate,
}: {
  reservationRequestGroup_id: string;
  biddingDate: Partial<TBiddingDate>;
}) => {
  const updatedBiddingDate = await ReservationRequestGroup.findByIdAndUpdate(
    reservationRequestGroup_id,

    {
      'biddingDate.startDate': isNaN(
        new Date(biddingDate?.startDate) as unknown as number,
      )
        ? undefined
        : new Date(biddingDate?.startDate),

      'biddingDate.endDate': isNaN(
        new Date(biddingDate?.endDate) as unknown as number,
      )
        ? undefined
        : new Date(biddingDate?.endDate),
    },
  );

  if (!updatedBiddingDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'bidding date can not be set, please try again',
    );
  }
  return true;
};
const selectBiddingWinner = async ({
  reservationRequestGroup_id,
  bid_id,
}: {
  reservationRequestGroup_id: string;
  bid_id: string;
}) => {
  const resGroup = await ReservationRequestGroup.findById(
    new mongoose.Types.ObjectId(reservationRequestGroup_id),
  );
  if (!resGroup) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No reservation request group with this id',
    );
  }

  if (resGroup?.postBiddingProcess?.biddingUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'bidding winner has already been selected for this reservation group',
    );
  }
  const winner = resGroup?.allBids.find(
    (bid) => bid?._id?.toString() === bid_id,
  );
  if (!winner) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no bid found with this bid_id for this reservation Group',
    );
  }
  let postBiddingProcess: Partial<TPostBiddingProcess> = {};

  postBiddingProcess = {
    biddingUser: winner?.biddingUser,
    serviceProviderCompany: winner?.serviceProviderCompany,
  };

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const updatedReservationRequestGroup =
      await ReservationRequestGroup.findByIdAndUpdate(
        new mongoose.Types.ObjectId(reservationRequestGroup_id),
        { postBiddingProcess },
        { new: true, session: session },
      );

    if (!updatedReservationRequestGroup) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not updated reservation request group',
      );
    }
    const updatedReservationRequests = await ReservationRequest.updateMany(
      {
        _id: { $in: resGroup.reservationRequests },
      },

      {
        status: 'accepted',
      },
      {
        new: true,
        session: session,
      },
    );
    if (
      updatedReservationRequests?.modifiedCount !==
      resGroup.reservationRequests?.length
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'could not updated reservation request status',
      );
    }

    await session.commitTransaction();
    await session.endSession();
    return updatedReservationRequestGroup;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};
const sendReservationGroupToBranch = async ({
  user,
  reservationRequestGroup_id,
  serviceProviderBranch_id,
}: {
  user: mongoose.Types.ObjectId;
  reservationRequestGroup_id: string;
  serviceProviderBranch_id: string;
}) => {
  const resGroup = await ReservationRequestGroup.findById(
    new mongoose.Types.ObjectId(reservationRequestGroup_id),
  );
  if (!resGroup) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No reservation request group with this id',
    );
  }
  if (!resGroup?.postBiddingProcess?.serviceProviderCompany) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This Reservation group bidding has not been ended',
    );
  }
  const userData = await userServices.getUserBy_id({
    _id: user?.toString() as string,
  });
  const serviceProviderCompany = userData[`${userData?.role}`]
    .serviceProviderCompany as mongoose.Types.ObjectId;
  if (!serviceProviderCompany) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'something went wrong, please try again',
    );
  }
  // console.log(serviceProviderCompany._id.toString());
  // console.log('break');
  // console.log(resGroup?.postBiddingProcess?.serviceProviderCompany?.toString());

  if (
    serviceProviderCompany?._id.toString() !==
    resGroup?.postBiddingProcess?.serviceProviderCompany?.toString()
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'your company is not bidding winner for this reservation request group',
    );
  }
  if (resGroup?.postBiddingProcess?.serviceProviderBranch) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This reservation group has already been sent to a service provider branch',
    );
  }

  const serviceProviderBranch = await ServiceProviderBranch.findById(
    new mongoose.Types.ObjectId(serviceProviderBranch_id),
  );
  if (!serviceProviderBranch) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'there have no any service provider branch found for serviceProviderBranch_id',
    );
  }
  // console.log(serviceProviderBranch?.serviceProviderCompany?.toString());
  // console.log('break');
  // console.log(serviceProviderCompany.toString());
  if (
    serviceProviderBranch?.serviceProviderCompany?.toString() !==
    serviceProviderCompany?._id?.toString()
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Branch _id you provided is not your company's branch",
    );
  }
  resGroup.postBiddingProcess.serviceProviderBranch =
    serviceProviderBranch?._id;
  const updatedReservationRequestGroup = await resGroup.save();

  if (
    !updatedReservationRequestGroup?.postBiddingProcess?.serviceProviderBranch
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Something went wrong, please try again',
    );
  }
  return updatedReservationRequestGroup;
};

const getReservationGroupById = async (reservationRequestGroup: string) => {
  const getReservationGroupData = await ReservationRequestGroup.findById(
    new mongoose.Types.ObjectId(reservationRequestGroup),
  ).populate([
    {
      path: 'reservationRequests',
      options: { strictPopulate: false },
    },
    {
      path: 'allBids.biddingUser',
      options: { strictPopulate: false },
    },
    {
      path: 'allBids.serviceProviderCompany',
      options: { strictPopulate: false },
    },
    {
      path: 'postBiddingProcess.biddingUser',
      options: { strictPopulate: false },
    },
    {
      path: 'postBiddingProcess.serviceProviderCompany',
      options: { strictPopulate: false },
    },
    {
      path: 'postBiddingProcess.serviceProviderBranch',
      options: { strictPopulate: false },
    },
    {
      path: 'postBiddingProcess.invoiceGroup',
      options: { strictPopulate: false },
    },
  ]);

  return getReservationGroupData;
};

const getLiveReservationGroups = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterQuery: any = {
    $and: [
      {
        isOnDemand: false,
      },
    ],
  };
  filterQuery?.$and.push({
    $or: [
      { 'postBiddingProcess.serviceProviderCompany': { $exists: false } },
      { 'postBiddingProcess.serviceProviderCompany': null },
    ],
  });
  filterQuery?.$and.push({
    $or: [
      { 'biddingDate.endDate': { $exists: false } },
      { 'biddingDate.endDate': { $gt: new Date() } },
    ],
  });
  filterQuery?.$and.push({
    $or: [
      { 'biddingDate.startDate': { $exists: true } },
      { 'biddingDate.startDate': { $lt: new Date() } },
    ],
  });
  // reservationRequests
  const result = await ReservationRequestGroup.find(filterQuery)
    .select('groupId groupName taskStatus biddingDate reservationRequests ')
    .populate([
      {
        path: 'reservationRequests',
        select: 'status machineType invoice schedule problem',
        populate: {
          path: 'user',
          select: 'phone showaUser email',
          populate: {
            path: 'showaUser',
            select: 'name addresses photoUrl',
            options: { strictPopulate: false },
          },

          options: { strictPopulate: false },
        },
      },
    ]);

  return result;
};
const getBidedReservationGroupsByCompany = async ({
  user,
}: {
  user: mongoose.Types.ObjectId;
}) => {
  const serviceProviderCompany = await ServiceProviderCompany.findOne({
    serviceProviderAdmin: user,
  });

  if (!serviceProviderCompany) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Something went wrong, please try again',
    );
  }

  const result = await ReservationRequestGroup.find({
    'allBids.serviceProviderCompany': serviceProviderCompany?._id,
  });
  return result;
};

const getAllUnAssignedResGroupToBranchByCompany = async ({
  user,
}: {
  user: mongoose.Types.ObjectId;
}) => {
  //
  const serviceProviderAdmin = await ServiceProviderAdmin.findOne({
    user,
  }).select('serviceProviderCompany');
  const result = await ReservationRequestGroup.find({
    'postBiddingProcess.serviceProviderCompany':
      serviceProviderAdmin.serviceProviderCompany,
    'postBiddingProcess.serviceProviderBranch': { $exists: false },
  });

  return result;
};

const getAllOnDemandResGroupByCompany = async ({
  user,
}: {
  user: mongoose.Types.ObjectId;
}) => {
  //
  const serviceProviderAdmin = await ServiceProviderAdmin.findOne({
    user,
  }).select('serviceProviderCompany');
  const result = await ReservationRequestGroup.find({
    'postBiddingProcess.serviceProviderCompany':
      serviceProviderAdmin.serviceProviderCompany,
    isOnDemand: true,
  });

  return result;
};
const getAllOnDemandUnassignedToCompanyResGroups = async () => {
  const result = await ReservationRequestGroup.find({
    isOnDemand: true,
    $and: [
      {
        'postBiddingProcess.serviceProviderCompany': { $exists: false },
        'postBiddingProcess.serviceProviderBranch': { $exists: false },
      },
    ],
  }).populate([
    {
      path: 'reservationRequests',
      options: { strictPopulate: false },
    },
    // {
    //   path: 'user',
    //   populate: { path: 'showaUser', options: { strictPopulate: false } },
    // },
  ]);

  return result;
};
const acceptOnDemandResGroupByCompany = async ({
  auth,
  reservationGroup,
  serviceProviderBranch_id,
}: {
  auth: TAuth;
  reservationGroup: string;
  serviceProviderBranch_id: string;
}) => {
  const reservationGroupData =
    await ReservationRequestGroup.findById(reservationGroup);

  if (!reservationGroupData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no reservation group found with this reservation group _id',
    );
  }

  if (!reservationGroupData?.isOnDemand) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This reservation group is not on theDemand list',
    );
  }

  if (reservationGroupData?.postBiddingProcess?.serviceProviderBranch) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This reservation group has already accepted by the branch',
    );
  }

  // console.log(serviceProviderCompany._id.toString());
  // console.log('break');
  // console.log(resGroup?.postBiddingProcess?.serviceProviderCompany?.toString());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let serviceProviderBranch: any;
  if (auth?.role === 'serviceProviderBranchManager') {
    //
    const serviceProviderBranchManager =
      await ServiceProviderBranchManager.findOne({
        user: auth?._id,
      });

    if (!serviceProviderBranchManager) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You are not a manager of any branch',
      );
    }

    serviceProviderBranch = await ServiceProviderBranch.findById(
      serviceProviderBranchManager?.currentState?.serviceProviderBranch?.toString(),
    );
    if (!serviceProviderBranch) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'there have no any service provider branch found for serviceProviderBranch_id',
      );
    }
  } else if (auth?.role === 'serviceProviderAdmin') {
    serviceProviderBranch = await ServiceProviderBranch.findById(
      new mongoose.Types.ObjectId(serviceProviderBranch_id),
    );
    if (!serviceProviderBranch) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'there have no any service provider branch found for serviceProviderBranch_id',
      );
    }
  }
  const postBiddingProcess: Partial<TPostBiddingProcess> = {};

  postBiddingProcess.serviceProviderCompany =
    serviceProviderBranch?.serviceProviderCompany;

  postBiddingProcess.serviceProviderBranch = serviceProviderBranch?._id;
  postBiddingProcess.biddingUser = auth?._id;

  const updatedReservationRequestGroup =
    await ReservationRequestGroup.findByIdAndUpdate(
      reservationGroup,
      { postBiddingProcess },
      { new: true },
    );

  if (!updatedReservationRequestGroup) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'could not updated reservation request group',
    );
  }

  return updatedReservationRequestGroup;

  // console.log(serviceProviderBranch?.serviceProviderCompany?.toString());
  // console.log('break');
  // console.log(serviceProviderCompany.toString());

  // resGroup.postBiddingProcess.serviceProviderBranch =
  //   serviceProviderBranch?._id;
  // const updatedReservationRequestGroup = await resGroup.save();

  // if (
  //   !updatedReservationRequestGroup?.postBiddingProcess?.serviceProviderBranch
  // ) {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     'Something went wrong, please try again',
  //   );
  // }
  // return updatedReservationRequestGroup;
};
const updateBid = async ({
  user,
  reservationRequestGroup_id,
  biddingAmount,
}: {
  user: mongoose.Types.ObjectId;
  reservationRequestGroup_id: string;
  biddingAmount: number;
}) => {
  const serviceProviderAdmin = await ServiceProviderAdmin.findOne({
    user,
  }).select('serviceProviderCompany');

  const updatedReservationGroup =
    await ReservationRequestGroup.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(reservationRequestGroup_id),
        'allBids.serviceProviderCompany':
          serviceProviderAdmin?.serviceProviderCompany,
      },
      {
        $set: {
          'allBids.$.biddingAmount': biddingAmount,
        },
      },
      {
        new: true,
      },
    );
  if (!updatedReservationGroup) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Something went wrong, please try again',
    );
  }
  return updatedReservationGroup;
};

const deleteBid = async ({
  user,
  reservationRequestGroup,
}: {
  user: mongoose.Types.ObjectId;
  reservationRequestGroup: string;
}) => {
  const serviceProviderAdmin = await ServiceProviderAdmin.findOne({
    user,
  }).select('serviceProviderCompany');

  // const reservationGroup = await ReservationRequestGroup.findOne({
  //   _id: new mongoose.Types.ObjectId(reservationRequestGroup),
  //   'allBids.serviceProviderCompany':
  //     serviceProviderAdmin?.serviceProviderCompany,
  // });

  // if (!reservationGroup) {
  //   throw new AppError(httpStatus.NOT_FOUND, 'No matching bid found');
  // }

  const updatedReservationGroup =
    await ReservationRequestGroup.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(reservationRequestGroup),
      },
      {
        $pull: {
          allBids: {
            serviceProviderCompany:
              serviceProviderAdmin?.serviceProviderCompany,
          },
        },
      },
      {
        new: true,
      },
    );

  if (!updatedReservationGroup) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Something went wrong, please try again',
    );
  }

  return updatedReservationGroup;
};

export const reservationGroupServices = {
  createReservationRequestGroup,
  addBid,
  setBiddingDate,
  selectBiddingWinner,
  sendReservationGroupToBranch,
  allReservationsGroup,
  getReservationGroupById,
  getLiveReservationGroups,
  getBidedReservationGroupsByCompany,
  getAllUnAssignedResGroupToBranchByCompany,
  getAllOnDemandResGroupByCompany,
  getAllOnDemandUnassignedToCompanyResGroups,
  acceptOnDemandResGroupByCompany,
  updateBid,
  deleteBid,
};

import mongoose from 'mongoose';
import { ReservationRequestGroup } from './reservationGroup.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { padNumberWithZeros } from '../../utils/padNumberWithZeros';
import { TRole } from '../user/user.interface';
import { ServiceProviderAdmin } from '../user/usersModule/serviceProviderAdmin/serviceProviderAdmin.model';
import { TPostBiddingProcess } from './reservationGroup.interface';
import { userServices } from '../user/user.service';
import { ServiceProviderBranch } from '../serviceProviderBranch/serviceProviderBranch.model';
import { ReservationRequest } from '../reservation/reservation.model';

const createReservationRequestGroup = async (
  reservationRequests: string[],
  groupName: string,
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const reservations = await ReservationRequest.find()
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

    reservations?.forEach((reservation) => {
      if (reservation.reservationRequestGroup) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Some of the reservation you provided has already been grouped',
        );
      }
    });

    const lastAddedReservationGroup = await ReservationRequestGroup.findOne(
      {},
      { groupId: 1 },
    ).sort({ _id: -1 });

    const groupId = padNumberWithZeros(
      Number(lastAddedReservationGroup?.groupId || '0000') + 1,
      4,
    );

    const reservationGroupArray = await ReservationRequestGroup.create(
      [
        {
          reservationRequests: reservationRequests.map(
            (each) => new mongoose.Types.ObjectId(each),
          ),
          groupId: groupId,
          groupName: groupName,
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


const allReservationsGroup = async () => {
  // reservationRequests
  const result = await ReservationRequestGroup.find({}).populate([
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
  ]);

  // return result?.map((each, i) => {
  //   return { ...each?._doc, groupName: `Group-${i + 1}` };
  // });

  return result;
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

  const userData = await userServices.getUserBy_id(user?.toString() as string);
  const serviceProviderCompany = userData[`${userData?.role}`]
    .serviceProviderCompany as mongoose.Types.ObjectId;
  if (!serviceProviderCompany) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'something went wrong, please try again',
    );
  }
  if (
    serviceProviderCompany.toString() !==
    resGroup?.postBiddingProcess?.serviceProviderCompany?.toString()
  ) {
    //
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

  if (
    serviceProviderBranch?.serviceProviderCompany?.toString() !==
    serviceProviderCompany.toString()
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
export const reservationGroupServices = {
  createReservationRequestGroup,
  addBid,
  selectBiddingWinner,
  sendReservationGroupToBranch,
  allReservationsGroup,
};

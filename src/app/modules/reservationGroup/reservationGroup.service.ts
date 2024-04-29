import mongoose from 'mongoose';
import { ReservationRequestGroup } from './reservationGroup.model';
import AppError from '../../errors/AppError';
import { ReservationRequest } from '../reservation/reservation.model';
import httpStatus from 'http-status';
import { padNumberWithZeros } from '../../utils/padNumberWithZeros';
import { TRole } from '../user/user.interface';
import { ServiceProviderAdmin } from '../user/usersModule/serviceProviderAdmin/serviceProviderAdmin.model';
import { TPostBiddingProcess } from './reservationGroup.interface';

const createReservationRequestGroup = async (reservationRequests: string[]) => {
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
      'nod bid found with this bid_id for this reservation Group',
    );
  }
  let postBiddingProcess: Partial<TPostBiddingProcess> = {};

  postBiddingProcess = {
    biddingUser: winner?.biddingUser,
    serviceProviderCompany: winner?.serviceProviderCompany,
  };
  const updatedReservationRequestGroup =
    await ReservationRequestGroup.findByIdAndUpdate(
      new mongoose.Types.ObjectId(reservationRequestGroup_id),
      { postBiddingProcess },
      { new: true },
    );
  return updatedReservationRequestGroup;
};

export const reservationGroupServices = {
  createReservationRequestGroup,
  addBid,
  selectBiddingWinner,
};

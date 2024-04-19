import mongoose from 'mongoose';
import { ReservationRequestGroup } from './reservationGroup.model';
import AppError from '../../errors/AppError';
import { v4 as uuidv4 } from 'uuid';
import { ReservationRequest } from '../reservation/reservation.model';
import httpStatus from 'http-status';

const createReservationRequestGroupService = async (ids: Array<string>) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const reservations = await ReservationRequest.find()
      .where('_id')
      .in(ids)
      .session(session);
    if (reservations?.length !== ids.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Some of the ids provided do not have an associated reservation request',
      );
    }
    const groupArray = await ReservationRequestGroup.create(
      [
        {
          reservationRequest: ids,
          groupId: uuidv4(),
        },
      ],
      { session: session },
    );
    // const invoiceIds = reservations.map((reservation) => reservation.invoice);

    if (!groupArray?.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'failed to create reservation group',
      );
    }
    // const invoiceGroupArray = await InvoiceGroup.create(
    //   [
    //     {
    //       invoiceGroupNo: uuidv4(),
    //       reservationRequestGroup: groupArray[0]._id,
    //       invoices: invoiceIds,
    //     },
    //   ],
    //   { session: session },
    // );
    // if (!invoiceGroupArray?.length) {
    //   throw new AppError(
    //     httpStatus.BAD_REQUEST,
    //     'failed to create invoice group',
    //   );
    // }
    await session.commitTransaction();
    await session.endSession();

    return groupArray[0];
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const addBidService = async (
  bid: {
    biddingUser: mongoose.Types.ObjectId;
    bidder: mongoose.Types.ObjectId;
    biddingAmount: number;
  },
  resGroupId: string,
) => {
  const resGroup = await ReservationRequestGroup.findById(resGroupId);
  if (!resGroup) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No reservation request group with this id',
    );
  }
  resGroup.allBids.push(bid);
  const updatedResGroup = await resGroup.save();
  return updatedResGroup;
};

export const reservationGroupServices = {
  createReservationRequestGroupService,
  addBidService,
};

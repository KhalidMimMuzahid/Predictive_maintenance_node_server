import mongoose from 'mongoose';
import { ReservationRequestGroup } from '../reservationGroup/reservationGroup.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { userServices } from '../user/user.service';

const assignReservationGroupToTeam = async ({
  user,
  reservationRequestGroup_id,
  teamOfEngineers_id,
}: {
  user: mongoose.Types.ObjectId;
  reservationRequestGroup_id: string;
  teamOfEngineers_id: string;
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
  if (!resGroup?.postBiddingProcess?.serviceProviderBranch) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This Reservation group has not been sent to any branch yet',
    );
  }

  const userData = await userServices.getUserBy_id(user?.toString() as string);

  const serviceProviderBranch = userData[`${userData?.role}`].currentState
    ?.serviceProviderBranch as mongoose.Types.ObjectId;

  if (!serviceProviderBranch) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'something went wrong, please try again',
    );
  }

  // above up; okk; now do below
  return { x: 'y' };
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

  console.log({ serviceProviderBranch });
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
  console.log({ updatedReservationRequestGroup });
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
export const invoiceGroupServices = {
  assignReservationGroupToTeam,
};

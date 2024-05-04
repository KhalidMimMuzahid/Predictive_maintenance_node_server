import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TeamOfEngineers } from '../teamOfEngineers/teamOfEngineers.model';
import { ServiceProviderEngineer } from '../user/usersModule/serviceProviderEngineer/serviceProviderEngineer.model';
import mongoose from 'mongoose';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getTeamOfEngineers = async (teamOfEngineers_id: any) => {
  const teamOfEngineers = await TeamOfEngineers.findById(teamOfEngineers_id);
  return teamOfEngineers;
};

export const getAllInvoicesOfReservationGroup = (
  invoice: any,
): mongoose.Types.ObjectId[] => {
  return invoice.invoiceGroup?.invoices as mongoose.Types.ObjectId[];
};

export const isEngineerBelongsToThisTeam = async (
  invoiceGroup: any,
  user: mongoose.Types.ObjectId,
) => {
  try {
    const teamOfEngineers = await getTeamOfEngineers(
      invoiceGroup?.taskAssignee?.teamOfEngineers,
    );
    if (!teamOfEngineers) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'you are not the engineer for this reservation or something went wrong',
      );
    }
    const userEngineerData = await ServiceProviderEngineer.findOne({
      user: user,
    });
    const isUserBelongsToThisTeam = teamOfEngineers.members.some(
      (each) => each.member.toString() === userEngineerData?._id?.toString(),
    );
    // console.log({ isUserBelongsToThisTeam });
    return {
      isUserBelongsToThisTeam,
      serviceProviderEngineer: userEngineerData?._id,
    };
  } catch (error) {
    return { isUserBelongsToThisTeam: false, serviceProviderEngineer: null };
  }
};

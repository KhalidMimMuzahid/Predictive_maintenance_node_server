import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TeamOfEngineers } from '../teamOfEngineers/teamOfEngineers.model';
import { ServiceProviderEngineer } from '../user/usersModule/serviceProviderEngineer/serviceProviderEngineer.model';
import mongoose from 'mongoose';
import { Invoice } from './invoice.model';

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

export const isEngineerBelongsToThisTeamByReservation = async ({
  user,
  reservationRequest,
}: {
  user: mongoose.Types.ObjectId;
  reservationRequest: string;
}) => {
  const invoiceData = (await Invoice.findOne({
    reservationRequest: new mongoose.Types.ObjectId(reservationRequest),
  })
    .select('invoiceGroup')
    .populate([
      {
        path: 'invoiceGroup',
        select: 'taskAssignee.teamOfEngineers',
        populate: {
          path: 'taskAssignee.teamOfEngineers',
          // select: 'taskAssignee.teamOfEngineers',
          select: 'members.member',
          populate: {
            path: 'members.member',
            select: 'user',
            options: { strictPopulate: false },
          },
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ])) as unknown as any;

  if (!invoiceData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'no invoice found for this reservation',
    );
  }
  const teamOfEngineersArray =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    invoiceData?.invoiceGroup?.taskAssignee?.teamOfEngineers?.members as any[];
  const engineerExistsInThisTeam = teamOfEngineersArray.findIndex(
    (each) => each?.member?.user?.toString() === user?.toString(),
  );

  return engineerExistsInThisTeam === (-1 || null || undefined) ? false : true;
};
export const isEngineerBelongsToThisTeamByInvoiceGroup = async (
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

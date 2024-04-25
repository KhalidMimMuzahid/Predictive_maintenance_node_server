/* eslint-disable no-unused-vars */
import { Types } from 'mongoose';
import { ServiceProviderBranchManager } from '../user/usersModule/branchManager/branchManager.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { ServiceProviderEngineer } from '../user/usersModule/serviceProviderEngineer/serviceProviderEngineer.model';

const makeTeamOfEngineerInToDB = async ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  teamName,
  serviceProviderEngineers,
  createdBy, // the user who sent this request; it an branch manager root user
}: {
  teamName: string;
  serviceProviderEngineers: string[];
  createdBy: Types.ObjectId;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const branchManagerData = await ServiceProviderBranchManager.findOne({
    user: createdBy,
  });
  let serviceProviderEngineers_id: Types.ObjectId[] = [];

  if (!serviceProviderEngineers?.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'serviceProviderEngineers array must have _id',
    );
  }

  try {
    serviceProviderEngineers_id = serviceProviderEngineers?.map(
      (each) => new Types.ObjectId(each),
    );
  } catch (error) {
    throw new AppError(httpStatus.BAD_REQUEST, 'engineers _id must be valid');
  }

  const serviceProviderEngineersData = await ServiceProviderEngineer.find({
    user: { $in: serviceProviderEngineers_id },
  });
  if (
    serviceProviderEngineers?.length !== serviceProviderEngineersData?.length
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'some of engineers _id you provided is not found',
    );
  }

  console.log({ serviceProviderEngineersData });

  return serviceProviderEngineersData; // for testing
};
export const teamOfEngineersServices = {
  makeTeamOfEngineerInToDB,
};

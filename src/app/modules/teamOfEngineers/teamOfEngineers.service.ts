import { TeamOfEngineers } from './teamOfEngineers.model';
import { Types } from 'mongoose';
import { ServiceProviderBranchManager } from '../user/usersModule/branchManager/branchManager.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { ServiceProviderEngineer } from '../user/usersModule/serviceProviderEngineer/serviceProviderEngineer.model';
import { TTeamOfEngineers } from './teamOfEngineers.interface';
import { User } from '../user/user.model';

const makeTeamOfEngineerInToDB = async ({
  teamName,
  serviceProviderEngineers,
  createdBy, // the user who sent this request; it an branch manager root user
}: {
  teamName: string;
  serviceProviderEngineers: string[];
  createdBy: Types.ObjectId;
}) => {
  const branchManagerData = await ServiceProviderBranchManager.findOne({
    user: createdBy,
  });

  const isExistTeamNameInSameBranch = await TeamOfEngineers.findOne({
    serviceProviderBranch:
      branchManagerData?.currentState?.serviceProviderBranch,
    teamName,
  });
  if (isExistTeamNameInSameBranch) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Team name already exists in the same branch',
    );
  }
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
    _id: { $in: serviceProviderEngineers_id },
  });
  if (
    serviceProviderEngineers?.length !== serviceProviderEngineersData?.length
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'some of engineers _id you provided is not found',
    );
  }

  let members = [];
  try {
    members = serviceProviderEngineersData?.map((each) => {
      if (
        each?.currentState?.serviceProviderCompany?.toString() !==
          branchManagerData?.currentState?.serviceProviderCompany?.toString() ||
        each?.currentState?.serviceProviderBranch?.toString() !==
          branchManagerData?.currentState?.serviceProviderBranch?.toString()
      ) {
        throw Error;
      }

      return {
        isDeleted: false,
        member: each?._id,
      };
    });
  } catch (error) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Some of engineers are not in your branch that you belongs to',
    );
  }

  const teamOfEngineers: Partial<TTeamOfEngineers> = {};
  teamOfEngineers.teamName = teamName;
  teamOfEngineers.createdBy = createdBy;
  teamOfEngineers.serviceProviderBranch =
    branchManagerData?.currentState?.serviceProviderBranch;
  teamOfEngineers.serviceProviderCompany =
    branchManagerData?.currentState?.serviceProviderCompany;
  teamOfEngineers.members = members;

  const createdTeamOfEngineers = await TeamOfEngineers.create(teamOfEngineers);

  return createdTeamOfEngineers; // for testing
};

const getAllTeamsOfEngineers = async () => {
  const allTeamsOfEngineersData = await TeamOfEngineers.find({})
    .populate({
      path: 'serviceProviderCompany',
      select: 'companyName address ',
    })
    .populate({ path: 'serviceProviderBranch', select: 'email' })
    .populate({
      path: 'members.member',
      select: 'user name',
    });

  const serviceProviderManagerDetails = async (
    serviceProviderBranchId: Types.ObjectId,
  ) => {
    const manager = await ServiceProviderBranchManager.findOne({
      'currentState.serviceProviderBranch': serviceProviderBranchId,
    });
    const name = manager?.name;
    const contact = await User.findById(manager?.user);
    return { name: name, phone: contact?.phone };
  };

  const result = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allTeamsOfEngineersData.map(async (team: any) => ({
      companyName: team.serviceProviderCompany?.companyName,
      location: team.serviceProviderCompany?.address,
      email: team.serviceProviderBranch?.email,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      members: team.members.map((member: any) => ({
        name: member.member.name,
        _id: member.member._id,
      })),
      serviceProviderBranchManager: await serviceProviderManagerDetails(
        team.serviceProviderBranch._id,
      ),
    })),
  );

  console.log(result);
  return result;
};

export const teamOfEngineersServices = {
  makeTeamOfEngineerInToDB,
  getAllTeamsOfEngineers,
};

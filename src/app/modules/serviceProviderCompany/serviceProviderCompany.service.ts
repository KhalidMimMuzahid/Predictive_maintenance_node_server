import mongoose from 'mongoose';
import { ServiceProviderCompany } from './serviceProviderCompany.model';
import { ServiceProviderAdmin } from '../user/usersModule/serviceProviderAdmin/serviceProviderAdmin.model';
import { ServiceProviderBranchManager } from '../user/usersModule/branchManager/branchManager.model';
import { ServiceProviderEngineer } from '../user/usersModule/serviceProviderEngineer/serviceProviderEngineer.model';
import { sortByCreatedAtDescending } from '../../utils/sortByCreatedAtDescending';
import { Invoice } from '../invoice/invoice.model';

const getServiceProviderCompanyForAdmin = async (
  _id: mongoose.Types.ObjectId,
) => {
  const serviceProviderCompany = await ServiceProviderCompany.findOne({
    serviceProviderAdmin: _id,
  });

  return serviceProviderCompany;
};
const getServiceProviderCompanyBy_id = async (
  serviceProviderCompany: string,
) => {
  const serviceProviderCompanyData = await ServiceProviderCompany.findById(
    serviceProviderCompany,
  ).populate([
    { path: 'serviceProviderAdmin', options: { strictPopulate: false } },
  ]);

  return serviceProviderCompanyData;
};
const getAllServiceProviderCompanies = async () => {
  const serviceProviderCompanies = await ServiceProviderCompany.find().populate(
    [
      {
        path: 'serviceProviderAdmin',

        populate: {
          path: 'serviceProviderAdmin',
          options: { strictPopulate: false },
        },
      },
    ],
  );

  return serviceProviderCompanies;
};

const getAllMembersForServiceProviderCompany = async (
  serviceProviderCompany: string,
) => {
  const admin = await ServiceProviderAdmin.findOne({
    serviceProviderCompany: new mongoose.Types.ObjectId(serviceProviderCompany),
  }).populate([
    {
      path: 'user',
      options: { strictPopulate: false },
    },
  ]);
  const serviceProviderSubAdmins = [];
  const serviceProviderBranchManagers = await ServiceProviderBranchManager.find(
    {
      'currentState.serviceProviderCompany': new mongoose.Types.ObjectId(
        serviceProviderCompany,
      ),
    },
  ).populate([
    {
      path: 'user',
      options: { strictPopulate: false },
    },
  ]);
  const serviceProviderEngineers = await ServiceProviderEngineer.find({
    'currentState.serviceProviderCompany': new mongoose.Types.ObjectId(
      serviceProviderCompany,
    ),
  }).populate([
    {
      path: 'user',
      options: { strictPopulate: false },
    },
  ]);

  const allMembersUnsorted = [
    admin,
    ...serviceProviderSubAdmins,
    ...serviceProviderBranchManagers,
    ...serviceProviderEngineers,
  ];

  const allMembers = sortByCreatedAtDescending({
    array: allMembersUnsorted,
    sort: 'desc',
  });

  return {
    allMembers,
    admin,
    serviceProviderSubAdmins,
    serviceProviderBranchManagers,
    serviceProviderEngineers,
  };
};

const getReservationRequestForServiceProviderAdmin = async (
  resType: string,
  adminUserid: mongoose.Types.ObjectId,
) => {
  const serviceProviderCompany = await ServiceProviderCompany.findOne({
    serviceProviderAdmin: adminUserid,
  });

  const matchQuery = {
    'postBiddingProcess.serviceProviderCompany': serviceProviderCompany._id,
  };
  if (resType !== 're-schedule') {
    matchQuery['postBiddingProcess.taskStatus'] = resType;
  }
  let aggArray;
  if (resType === 're-schedule') {
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

export const serviceProviderCompanyServices = {
  getServiceProviderCompanyForAdmin,
  getServiceProviderCompanyBy_id,
  getAllServiceProviderCompanies,
  getAllMembersForServiceProviderCompany,
  getReservationRequestForServiceProviderAdmin,
};

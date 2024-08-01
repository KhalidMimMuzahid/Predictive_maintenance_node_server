import mongoose from 'mongoose';
import { ServiceProviderCompany } from './serviceProviderCompany.model';
import { ServiceProviderAdmin } from '../user/usersModule/serviceProviderAdmin/serviceProviderAdmin.model';
import { ServiceProviderBranchManager } from '../user/usersModule/branchManager/branchManager.model';
import { ServiceProviderEngineer } from '../user/usersModule/serviceProviderEngineer/serviceProviderEngineer.model';
import { sortByCreatedAtDescending } from '../../utils/sortByCreatedAtDescending';

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


// This API is in Development. Not yet implemented
const getReservationRequestForServiceProviderAdmin = async (
  resType: string,
  adminUserid: mongoose.Types.ObjectId,
) => {
  console.log(resType);
  console.log('admin:' + adminUserid);
  const serviceProviderCompany = await ServiceProviderCompany.findOne({
    serviceProviderAdmin: adminUserid,
  });
  console.log('service provider company:' + serviceProviderCompany._id);
};

export const serviceProviderCompanyServices = {
  getServiceProviderCompanyForAdmin,
  getServiceProviderCompanyBy_id,
  getAllServiceProviderCompanies,
  getAllMembersForServiceProviderCompany,
  getReservationRequestForServiceProviderAdmin,
};

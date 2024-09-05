import mongoose from 'mongoose';
import { ServiceProviderCompany } from './serviceProviderCompany.model';
import { ServiceProviderAdmin } from '../user/usersModule/serviceProviderAdmin/serviceProviderAdmin.model';
import { ServiceProviderBranchManager } from '../user/usersModule/branchManager/branchManager.model';
import { ServiceProviderEngineer } from '../user/usersModule/serviceProviderEngineer/serviceProviderEngineer.model';
import { sortByCreatedAtDescending } from '../../utils/sortByCreatedAtDescending';
import { ServiceProviderBranch } from '../serviceProviderBranch/serviceProviderBranch.model';
import Shop from '../marketplace/shop/shop.model';
import { userServices } from '../user/user.service';

const getServiceProviderCompanyForAdmin = async (
  _id: mongoose.Types.ObjectId,
) => {
  const serviceProviderCompany = await ServiceProviderCompany.findOne({
    serviceProviderAdmin: _id,
  });

  return serviceProviderCompany;
};
const getAllProfileByServiceProviderCompany = async (
  _id: mongoose.Types.ObjectId,
) => {
  const personal = await userServices.getUserBy_id({
    _id: _id?.toString(),
    rootUserFields: '_id role',
    extendedUserFields: 'name photoUrl',
  });
  const serviceProviderCompany = await ServiceProviderCompany.findOne({
    serviceProviderAdmin: _id,
  }).select('_id companyName photoUrl');
  const serviceProviderBranches = await ServiceProviderBranch.find({
    serviceProviderCompany: serviceProviderCompany?._id,
  }).select('_id branchName photoUrl');
  const shops = await Shop.find({
    serviceProviderCompany: serviceProviderCompany?._id,
  }).select('shopName photoUrl');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profiles: any[] = [
    {
      type: 'personal',
      _id: personal?._id,
      name:
        personal[`${personal?.role}`]?.name?.firstName +
        ' ' +
        personal[`${personal?.role}`]?.name?.lastName,
    },
    {
      type: 'serviceProviderCompany',
      _id: serviceProviderCompany?._id,
      name: serviceProviderCompany?.companyName,
    },
  ];
  if (serviceProviderBranches?.length) {
    serviceProviderBranches?.forEach((serviceProviderBranch) => {
      profiles.push({
        type: 'serviceProviderBranch',
        _id: serviceProviderBranch?._id,
        name: serviceProviderBranch?.branchName,
      });
    });
  }
  if (shops?.length) {
    shops?.forEach((shop) => {
      profiles.push({
        type: 'shop',
        _id: shop?._id,
        name: shop?.shopName,
      });
    });
  }

  return profiles;
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

export const serviceProviderCompanyServices = {
  getServiceProviderCompanyForAdmin,
  getAllProfileByServiceProviderCompany,
  getServiceProviderCompanyBy_id,
  getAllServiceProviderCompanies,
  getAllMembersForServiceProviderCompany,
};

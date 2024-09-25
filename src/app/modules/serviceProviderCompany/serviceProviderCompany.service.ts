import mongoose from 'mongoose';
import { ServiceProviderCompany } from './serviceProviderCompany.model';
import { ServiceProviderAdmin } from '../user/usersModule/serviceProviderAdmin/serviceProviderAdmin.model';
import { ServiceProviderBranchManager } from '../user/usersModule/branchManager/branchManager.model';
import { ServiceProviderEngineer } from '../user/usersModule/serviceProviderEngineer/serviceProviderEngineer.model';
import { sortByCreatedAtDescending } from '../../utils/sortByCreatedAtDescending';
import { ServiceProviderBranch } from '../serviceProviderBranch/serviceProviderBranch.model';
import Shop from '../marketplace/shop/shop.model';
import { userServices } from '../user/user.service';
import {
  TCompanyStatus,
  TServiceProviderCompany,
} from './serviceProviderCompany.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { TSortType } from '../marketplace/product/product.interface';
import { TAuth } from '../../interface/error';

const getServiceProviderCompanyForAdmin = async (
  _id: mongoose.Types.ObjectId,
) => {
  const serviceProviderCompany = await ServiceProviderCompany.findOne({
    serviceProviderAdmin: _id,
  });

  return serviceProviderCompany;
};

const editServiceProviderCompany = async ({
  user,
  serviceProviderCompany,
  serviceProviderCompanyData,
  auth,
}: {
  user: mongoose.Types.ObjectId;
  serviceProviderCompany: string;
  serviceProviderCompanyData: Partial<TServiceProviderCompany>;
  auth: TAuth;
}) => {
  //

  const existingServiceProviderCompany = await ServiceProviderCompany.findById(
    serviceProviderCompany,
  );

  if (!existingServiceProviderCompany) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'serviceProviderCompany is not found with this serviceProviderCompany ID',
    );
  }

  if (
    existingServiceProviderCompany?.serviceProviderAdmin?.toHexString() !==
      user.toString() &&
    auth?.role !== 'showaAdmin'
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'you are not the admin this serviceProviderCompany',
    );
  }

  if (serviceProviderCompanyData?.companyName) {
    existingServiceProviderCompany.companyName =
      serviceProviderCompanyData?.companyName;
  }

  if (serviceProviderCompanyData?.photoUrl) {
    existingServiceProviderCompany.photoUrl =
      serviceProviderCompanyData?.photoUrl;
  }
  if (serviceProviderCompanyData?.address) {
    existingServiceProviderCompany.address =
      serviceProviderCompanyData?.address;
  }
  if (serviceProviderCompanyData?.representativeName) {
    existingServiceProviderCompany.representativeName =
      serviceProviderCompanyData?.representativeName;
  }
  if (serviceProviderCompanyData?.fax) {
    existingServiceProviderCompany.fax = serviceProviderCompanyData?.fax;
  }
  if (serviceProviderCompanyData?.corporateNo) {
    existingServiceProviderCompany.corporateNo =
      serviceProviderCompanyData?.corporateNo;
  }
  if (serviceProviderCompanyData?.phone) {
    existingServiceProviderCompany.phone = serviceProviderCompanyData?.phone;
  }
  if (serviceProviderCompanyData?.currency) {
    existingServiceProviderCompany.currency =
      serviceProviderCompanyData?.currency;
  }
  if (serviceProviderCompanyData?.invoiceRegistrationNo) {
    existingServiceProviderCompany.invoiceRegistrationNo =
      serviceProviderCompanyData?.invoiceRegistrationNo;
  }

  if (serviceProviderCompanyData?.services?.length > 0) {
    existingServiceProviderCompany.services =
      serviceProviderCompanyData?.services;
  }
  if (serviceProviderCompanyData?.registrationDocument?.length > 0) {
    existingServiceProviderCompany.registrationDocument =
      serviceProviderCompanyData?.registrationDocument;
  }
  if (serviceProviderCompanyData?.capital) {
    existingServiceProviderCompany.capital =
      serviceProviderCompanyData?.capital;
  }
  if (serviceProviderCompanyData?.bank) {
    // const BankUpdateValidationSchema = z.object({
    //   bankName: z.string().optional(),
    //   branchName: z.string().optional(),
    //   accountNo: z.number().optional(),
    //   postalCode: z.string().optional(),
    //   // address: createAddressValidationSchema.optional(),
    //   departmentInCharge: z.string().optional(),
    //   personInChargeName: z.string().optional(),
    //   // card: createCardValidationSchema,
    // });
    const newBank = { ...existingServiceProviderCompany?.bank };
    if (serviceProviderCompanyData?.bank?.bankName) {
      newBank.bankName = serviceProviderCompanyData?.bank?.bankName;
    }
    if (serviceProviderCompanyData?.bank?.branchName) {
      newBank.branchName = serviceProviderCompanyData?.bank?.branchName;
    }
    if (serviceProviderCompanyData?.bank?.accountNo) {
      newBank.accountNo = serviceProviderCompanyData?.bank?.accountNo;
    }
    if (serviceProviderCompanyData?.bank?.postalCode) {
      newBank.postalCode = serviceProviderCompanyData?.bank?.postalCode;
    }
    if (serviceProviderCompanyData?.bank?.departmentInCharge) {
      newBank.departmentInCharge =
        serviceProviderCompanyData?.bank?.departmentInCharge;
    }
    if (serviceProviderCompanyData?.bank?.personInChargeName) {
      newBank.personInChargeName =
        serviceProviderCompanyData?.bank?.personInChargeName;
    }
    existingServiceProviderCompany.bank = newBank;
  }

  if (serviceProviderCompanyData?.emergencyContact) {
    const emergencyContact = serviceProviderCompanyData?.emergencyContact;
    if (emergencyContact?.departmentInCharge) {
      serviceProviderCompanyData.emergencyContact.departmentInCharge =
        emergencyContact?.departmentInCharge;
    }
    if (emergencyContact?.personInChargeName) {
      serviceProviderCompanyData.emergencyContact.personInChargeName =
        emergencyContact?.personInChargeName;
    }
    if (emergencyContact?.contactNo) {
      serviceProviderCompanyData.emergencyContact.contactNo =
        emergencyContact?.contactNo;
    }
    if (emergencyContact?.email) {
      serviceProviderCompanyData.emergencyContact.email =
        emergencyContact?.email;
    }
  }
  const updatedServiceProviderCompany =
    await existingServiceProviderCompany.save();

  if (!updatedServiceProviderCompany) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Something went wrong, please try again',
    );
  }
  return updatedServiceProviderCompany;
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
const getAllServiceProviderCompanies = async ({
  area,
  sortType,
  status,
}: {
  area: string;
  sortType: TSortType;
  status: TCompanyStatus;
}) => {
  const query = {};
  if (area) {
    query['address.city'] = area;
  }

  if (status) {
    query['status'] = status;
  }
  const serviceProviderCompanies = await ServiceProviderCompany.find(query)
    .sort({
      createdAt: sortType === 'desc' ? -1 : 1,
    })
    .populate([
      {
        path: 'serviceProviderAdmin',

        populate: {
          path: 'serviceProviderAdmin',
          options: { strictPopulate: false },
        },
      },
    ]);

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
  editServiceProviderCompany,
  getAllProfileByServiceProviderCompany,
  getServiceProviderCompanyBy_id,
  getAllServiceProviderCompanies,
  getAllMembersForServiceProviderCompany,
};

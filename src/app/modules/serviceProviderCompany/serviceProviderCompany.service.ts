import mongoose from 'mongoose';
import { ServiceProviderCompany } from './serviceProviderCompany.model';

const getServiceProviderCompanyForAdmin = async (
  _id: mongoose.Types.ObjectId,
) => {
  const serviceProviderCompany = await ServiceProviderCompany.findOne({
    serviceProviderAdmin: _id,
  });

  return serviceProviderCompany;
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

export const serviceProviderCompanyServices = {
  getServiceProviderCompanyForAdmin,
  getAllServiceProviderCompanies,
};

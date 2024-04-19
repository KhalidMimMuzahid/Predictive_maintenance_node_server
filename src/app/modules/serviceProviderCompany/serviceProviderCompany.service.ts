import { Types } from 'mongoose';
import { ServiceProviderCompany } from './serviceProviderCompany.model';

const getServiceProviderCompanyForAdmin = async (
  _id: string | Types.ObjectId,
) => {
  const serviceProviderCompany = await ServiceProviderCompany.findOne({
    serviceProviderAdmin: _id,
  });

  return serviceProviderCompany;
};
export const serviceProviderCompanyServices = {
  getServiceProviderCompanyForAdmin,
};

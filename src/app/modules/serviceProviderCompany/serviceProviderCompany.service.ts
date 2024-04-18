import { Types } from 'mongoose';
import { ServiceProviderCompany } from './serviceProviderCompany.model';

const getServiceProviderCompanyForAdmin = async (_id: string) => {
  const serviceProviderCompany = await ServiceProviderCompany.findOne({
    serviceProviderAdmin: new Types.ObjectId(_id),
  });

  return serviceProviderCompany;
};
export const serviceProviderCompanyServices = {
  getServiceProviderCompanyForAdmin,
};

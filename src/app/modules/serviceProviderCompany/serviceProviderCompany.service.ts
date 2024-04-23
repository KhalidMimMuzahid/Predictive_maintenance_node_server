import { Types } from 'mongoose';
import { ServiceProviderCompany } from './serviceProviderCompany.model';

<<<<<<< HEAD
const getServiceProviderCompanyForAdmin = async (
  _id: string | Types.ObjectId,
) => {
=======
const getServiceProviderCompanyForAdmin = async (_id: Types.ObjectId) => {
>>>>>>> 12ab0619eb4a71c040f35f8bdc58f4192d08d1d7
  const serviceProviderCompany = await ServiceProviderCompany.findOne({
    serviceProviderAdmin: _id,
  });

  return serviceProviderCompany;
};
export const serviceProviderCompanyServices = {
  getServiceProviderCompanyForAdmin,
};

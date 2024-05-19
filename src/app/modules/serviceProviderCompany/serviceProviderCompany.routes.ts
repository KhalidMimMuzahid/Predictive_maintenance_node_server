import express, { Router } from 'express';
import { serviceProviderCompanyControllers } from './serviceProviderCompany.controller';

const router: Router = express.Router();

// for service provider company admin
router.get(
  '/service-provider-company-for-admin',
  serviceProviderCompanyControllers.getServiceProviderCompanyForAdmin,
);
router.get(
  '/get-all-service-provider-companies',
  serviceProviderCompanyControllers.getAllServiceProviderCompanies,
);
router.get(
  '/get-all-members-for-service-provider-company',
  serviceProviderCompanyControllers.getAllMembersForServiceProviderCompany,
);



export const serviceProviderCompanyRoutes = router;

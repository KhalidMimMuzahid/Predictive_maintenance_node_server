import express, { Router } from 'express';
import { serviceProviderCompanyControllers } from './serviceProviderCompany.controller';

const router: Router = express.Router();

router.get(
  '/service-provider-company-for-admin',
  serviceProviderCompanyControllers.getServiceProviderCompanyForAdmin,
);
export const serviceProviderCompanyRoutes = router;

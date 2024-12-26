import express, { Router } from 'express';
import { serviceProviderCompanyControllers } from './serviceProviderCompany.controller';
import validateRequest from '../../middlewares/validateRequest';
import { serviceProviderAdminValidation } from '../user/usersModule/serviceProviderAdmin/serviceProviderAdmin.validation';

const router: Router = express.Router();

// for service provider company admin
router.get(
  '/service-provider-company-for-admin',
  serviceProviderCompanyControllers.getServiceProviderCompanyForAdmin,
);
router.patch(
  '/edit-service-provider-company',
  validateRequest(
    serviceProviderAdminValidation.serviceProviderCompanyUpdateValidationSchema,
  ),
  serviceProviderCompanyControllers.editServiceProviderCompany,
);
router.get(
  '/get-all-profile-by-service-provider-company',
  serviceProviderCompanyControllers.getAllProfileByServiceProviderCompany,
);
router.get(
  '/service-provider-company-by_id',
  serviceProviderCompanyControllers.getServiceProviderCompanyBy_id,
);
router.get(
  '/get-all-service-provider-companies',
  serviceProviderCompanyControllers.getAllServiceProviderCompanies,
);
router.get(
  '/get-all-members-for-service-provider-company',
  serviceProviderCompanyControllers.getAllMembersForServiceProviderCompany,
);
router.get(
  '/get-main-dashboard-first-section-summary',
  serviceProviderCompanyControllers.getMainDashboardFirstSectionSummary,
);
router.get(
  '/get-main-dashboard-report-card-summary',
  serviceProviderCompanyControllers.getMainDashboardReportCardSummary,
);

export const serviceProviderCompanyRoutes = router;

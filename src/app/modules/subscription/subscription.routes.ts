import express, { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { subscriptionControllers } from './subscription.controller';
import { subscriptionValidation } from './subscription.validation';

const router: Router = express.Router();

router.post(
  '/create-subscription',
  validateRequest(subscriptionValidation.createSubscriptionSchema),
  subscriptionControllers.createSubscription,
);
router.get(
  '/get-subscriptions-by-id',
  subscriptionControllers.getSubscriptionsById,
);

router.get(
  '/get-all-offered-subscriptions-for-showaUser',
  subscriptionControllers.getAllOfferedSubscriptionsForShowaUser,
);


router.get(
  '/get-all-offered-subscriptions-for-service-provider-company',
  subscriptionControllers.getAllOfferedSubscriptionsForServiceProviderCompany,
);

export const subscriptionRoutes = router;

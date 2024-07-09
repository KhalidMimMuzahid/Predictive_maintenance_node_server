import express, { Router } from 'express';
import validateRequest from '../../../middlewares/validateRequest';
import { shopValidation } from './shop.validation';
import { shopController } from './shop.controller';

const router: Router = express.Router();

router.post(
  '/create',
  validateRequest(shopValidation.createShopValidationSchema),
  shopController.createShop,
);

export const shopRoutes = router;

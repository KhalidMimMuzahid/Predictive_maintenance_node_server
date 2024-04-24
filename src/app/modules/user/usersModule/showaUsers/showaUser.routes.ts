import express, { Router } from 'express';
import { showaUserControllers } from './showaUser.controller';
import validateRequest from '../../../../middlewares/validateRequest';
import { showaUserValidation } from './showaUser.validation';

const router: Router = express.Router();

router.post(
  '/sign-up',
  validateRequest(showaUserValidation.userCreateValidationSchema),
  showaUserControllers.createShowaUser,
);

router.patch('/address', showaUserControllers.updateAddress);

export const showaUserRoutes = router;

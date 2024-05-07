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
router.get('/get-showa-user', showaUserControllers.getShowaUser);

router.patch('/address', showaUserControllers.updateAddress);
router.put('/update-profile', showaUserControllers.updateProfile);

router.post('/upload-photo', showaUserControllers.uploadProfilePhoto);

export const showaUserRoutes = router;

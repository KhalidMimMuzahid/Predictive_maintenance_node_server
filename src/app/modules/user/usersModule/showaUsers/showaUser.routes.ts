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
router.put('/update-profile', showaUserControllers.updateProfile);

<<<<<<< HEAD
router.get('/sign-in', showaUserControllers.signIn);
router.post('/upload-photo', showaUserControllers.uploadProfilePhoto);
=======
>>>>>>> b6cfee92b67aa146ccd8dd7ac5d16c967aba5f05
export const showaUserRoutes = router;

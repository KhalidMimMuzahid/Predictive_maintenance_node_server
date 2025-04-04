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
router.get('/get-showa-user-by-user', showaUserControllers.getShowaUserBy_user);
router.get(
  '/get-showa-user-with-phone-email',
  showaUserControllers.getShowaUserByPhoneOrEmail,
);
router.get('/get-my-showa-contact', showaUserControllers.getShowaUserContacts);

router.patch('/address', showaUserControllers.updateAddress);
router.put('/update-profile', showaUserControllers.updateProfile);

router.post('/upload-photo', showaUserControllers.uploadProfilePhoto);

export const showaUserRoutes = router;

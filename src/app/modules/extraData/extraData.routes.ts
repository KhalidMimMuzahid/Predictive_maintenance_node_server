import express, { Router } from 'express';

import validateRequest from '../../middlewares/validateRequest';
import { extraDataController } from './extraData.controller';
import { extraDataValidation } from './extraData.validation';
const router: Router = express.Router();

router.post('/delete-my-account', extraDataController.deleteMyAccount);
router.post(
  '/add-feedback',
  validateRequest(extraDataValidation.addFeedbackValidationSchema),
  extraDataController.addFeedback,
);
router.post('/create-coupon', extraDataController.createCoupon);
router.patch('/activate-coupon', extraDataController.activateCoupon);
router.post('/create-faq', extraDataController.createFaq);
router.get('/get-all-faq', extraDataController.getAllFaq);
router.patch('/edit-faq', extraDataController.editFaq);
router.delete('/edit-faq', extraDataController.deleteFaq);

router.post(
  '/invite-member',
  validateRequest(extraDataValidation.inviteMemberValidationSchema),
  extraDataController.inviteMember,
);
router.get('/invited-member-by-id', extraDataController.invitedMemberById);
router.get(
  '/invited-member-by-email',
  extraDataController.invitedMemberByEmail,
);

router.patch('/review-feedback', extraDataController.reviewFeedback);

router.post('/upload-photo', extraDataController.uploadPhoto);

// those router is only for testings
router.get('/send-iot-data-ai-server', extraDataController.sendIotDataAiServer);

export const extraDataRoutes = router;

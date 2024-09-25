import express, { Router } from 'express';

import { extraDataController } from './extraData.controller';
import validateRequest from '../../middlewares/validateRequest';
import { extraDataValidation } from './extraData.validation';
const router: Router = express.Router();

router.post('/delete-my-account', extraDataController.deleteMyAccount);
router.post(
  '/add-feedback',
  validateRequest(extraDataValidation.addFeedbackValidationSchema),
  extraDataController.addFeedback,
);
router.post(
  '/invite-member',
  validateRequest(extraDataValidation.inviteMemberValidationSchema),
  extraDataController.inviteMember,
);
router.get('/invited-member-by-id', extraDataController.invitedMemberById);
router.patch('/review-feedback', extraDataController.reviewFeedback);

router.post('/upload-photo', extraDataController.uploadPhoto);

// those router is only for testings
router.get('/send-iot-data-ai-server', extraDataController.sendIotDataAiServer);


export const extraDataRoutes = router;

import express, { Router } from 'express';
import validateRequest from '../../../middlewares/validateRequest';
import { chatValidation } from './chat.validation';
import { chatController } from './chat.controller';

const router: Router = express.Router();

router.post(
  '/create-personal-chat',
  validateRequest(chatValidation.createPersonalChatValidationSchema),
  chatController.createPersonalChat,
);

export const chatRoutes = router;

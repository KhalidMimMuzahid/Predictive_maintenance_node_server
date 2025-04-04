import express, { Router } from 'express';
import { messageController } from './message.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { messageValidation } from './message.validation';

const router: Router = express.Router();

router.post(
  '/send-message',
  validateRequest(messageValidation.messageValidationSchema),
  messageController.sendMessage,
);
router.get('/get-messages-by-chat', messageController.getMessagesByChat);
router.get('/get-last-message-by-chat', messageController.getLastMessageByChat);

export const messageRoutes = router;

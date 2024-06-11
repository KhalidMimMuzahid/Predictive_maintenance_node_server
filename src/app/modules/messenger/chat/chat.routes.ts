import express, { Router } from 'express';
import validateRequest from '../../../middlewares/validateRequest';
import { chatValidation } from './chat.validation';
import { chatController } from './chat.controller';

const router: Router = express.Router();

router.post(
  '/create-personal-chat',
  // validateRequest(chatValidation.createPersonalChatValidationSchema),
  chatController.createPersonalChat,
);


router.post(
  '/create-personal-chat-by-phone-or-email',
  // validateRequest(chatValidation.createPersonalChatValidationSchema),
  chatController.createPersonalChatByPhoneOrEmail,
);


router.post(
  '/create-group-chat',
  validateRequest(chatValidation.createGroupChatValidationSchema),
  chatController.createGroupChat,
);
router.get('/get-my-all-chats', chatController.getMyAllChats);

export const chatRoutes = router;

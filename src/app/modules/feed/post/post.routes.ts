import express, { Router } from 'express';
import { postController } from './post.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { postValidation } from './post.validation';

const router: Router = express.Router();

router.post(
  '/create',
  validateRequest(postValidation.createPostValidationSchema),
  postController.createPost,
);
router.post(
  '/share',
  validateRequest(postValidation.sharedPostValidationSchema),
  postController.sharePost,
);

router.patch('/add-like', postController.likePost);
router.patch('/remove-like', postController.unlikePost);
router.patch('/add-comment', postController.commentPost);
router.patch('/remove-comment', postController.removeComment);
router.patch('/add-replay-into-comment', postController.addReplayIntoComment);






router.get('/get-posts-for-my-feed', postController.getPostsForMyFeed);

export const postRoutes = router;

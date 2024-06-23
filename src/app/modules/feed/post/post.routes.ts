import express, { Router } from 'express';
import { postController } from './post.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { postValidation } from './post.validation';

const router: Router = express.Router();

router.post(
  '/create-post',
  validateRequest(postValidation.createPostValidationSchema),
  postController.createPost,
);
router.post(
  '/share-post',
  validateRequest(postValidation.sharedPostValidationSchema),
  postController.sharePost,
);

router.patch('/like-post', postController.likePost);
router.get('/get-posts-for-my-feed', postController.getPostsForMyFeed);

export const postRoutes = router;

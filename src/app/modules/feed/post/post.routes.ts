import express, { Router } from 'express';
import validateRequest from '../../../middlewares/validateRequest';
import { postController } from './post.controller';
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
router.patch(
  '/remove-replay-from-comment',
  postController.removeReplayFromComment,
);

router.get('/get-all-likes-by-post', postController.getAllLikesByPost);
router.get('/get-all-comments-by-post', postController.getAllCommentsByPost);
router.get(
  '/get-all-replays-by-comment',
  postController.getAllReplaysByComment,
);
router.get('/get-all-shares-by-post', postController.getAllSharesByPost);

router.get('/get-posts-for-my-feed', postController.getPostsForMyFeed);
router.get('/get-post-by-postId', postController.getPostByPostId);
router.delete('/delete-post', postController.deletePost);
router.get('/get-post-by-user', postController.getAllPostsByUser);
router.get(
  '/get-recent-search-for-customer-app',
  postController.getRecentSearchForCustomerApp,
);
router.patch('/edit-post', postController.editPost);
router.post('/hide-post', postController.hidePost);

router.get(
  '/get-recent-search-for-super-admin-web',
  postController.getRecentSearchForSuperAdminWeb,
);
router.get(
  '/get-top-selling-products-from-feed',
  postController.getTopSellingProductsFromFeed,
);

export const postRoutes = router;

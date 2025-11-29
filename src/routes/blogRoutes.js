import { Router } from 'express'
import {
  createBlogHandler,
  deleteBlogHandler,
  listBlogs,
  showBlog,
  showBlogBySlug,
  updateBlogHandler,
  listPublishedBlogs,
  listFeaturedBlogs,
} from '../controllers/blogController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { createBlogSchema, updateBlogSchema } from '../validations/blogValidation.js'

const router = Router()

// Public routes (for frontend)
router.get('/published', listPublishedBlogs)
router.get('/featured', listFeaturedBlogs)
router.get('/slug/:slug', showBlogBySlug)

// Admin routes
router
  .route('/')
  .get(listBlogs)
  .post(validateRequest(createBlogSchema), createBlogHandler)

router
  .route('/:id')
  .get(showBlog)
  .put(validateRequest(updateBlogSchema), updateBlogHandler)
  .delete(deleteBlogHandler)

export default router


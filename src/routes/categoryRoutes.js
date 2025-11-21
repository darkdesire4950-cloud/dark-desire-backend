import { Router } from 'express'
import {
  createCategoryHandler,
  deleteCategoryHandler,
  listCategories,
  showCategory,
  updateCategoryHandler,
} from '../controllers/categoryController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { createCategorySchema, updateCategorySchema } from '../validations/categoryValidation.js'

const router = Router()

router
  .route('/')
  .get(listCategories)
  .post(validateRequest(createCategorySchema), createCategoryHandler)

router
  .route('/:id')
  .get(showCategory)
  .put(validateRequest(updateCategorySchema), updateCategoryHandler)
  .delete(deleteCategoryHandler)

export default router


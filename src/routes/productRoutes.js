import { Router } from 'express'
import {
  createProductHandler,
  deleteProductHandler,
  listProducts,
  showProduct,
  updateProductHandler,
} from '../controllers/productController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { createProductSchema, updateProductSchema } from '../validations/productValidation.js'

const router = Router()

router.route('/').get(listProducts).post(validateRequest(createProductSchema), createProductHandler)

router
  .route('/:id')
  .get(showProduct)
  .put(validateRequest(updateProductSchema), updateProductHandler)
  .delete(deleteProductHandler)

export default router


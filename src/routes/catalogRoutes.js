import { Router } from 'express'
import {
  createCatalogHandler,
  deleteCatalogHandler,
  listCatalogs,
  showCatalog,
  updateCatalogHandler,
} from '../controllers/catalogController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { createCatalogSchema, updateCatalogSchema } from '../validations/catalogValidation.js'

const router = Router()

router
  .route('/')
  .get(listCatalogs)
  .post(validateRequest(createCatalogSchema), createCatalogHandler)

router
  .route('/:id')
  .get(showCatalog)
  .put(validateRequest(updateCatalogSchema), updateCatalogHandler)
  .delete(deleteCatalogHandler)

export default router


import { Router } from 'express'
import {
  submitCustomization,
  getAllCustomizations,
  getCustomizationById,
  updateCustomization,
  deleteCustomization,
  uploadImages,
} from '../controllers/customizationController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { customizationSchema } from '../validations/customizationValidation.js'

const router = Router()

// Get all customizations (admin) - must be before /:id route
router.get('/', getAllCustomizations)

// Test route to verify the endpoint is accessible
router.get('/test', (req, res) => {
  res.json({ message: 'Customization route is working', path: '/api/customizations' })
})

// Submit customization request (with file upload)
// Note: Validation happens in controller after file upload
router.post(
  '/',
  uploadImages,
  submitCustomization,
)

// Get customization by ID
router.get('/:id', getCustomizationById)

// Update customization (admin)
router.put('/:id', validateRequest(customizationSchema), updateCustomization)

// Delete customization
router.delete('/:id', deleteCustomization)

export default router


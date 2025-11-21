import { Router } from 'express'
import { submitInquiry } from '../controllers/inquiryController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { inquirySchema } from '../validations/inquiryValidation.js'

const router = Router()

router.post('/', validateRequest(inquirySchema), submitInquiry)

export default router


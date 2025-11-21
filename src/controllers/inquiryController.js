import { asyncHandler } from '../middleware/asyncHandler.js'
import { sendInquiryEmail } from '../services/emailService.js'
import { ApiResponse } from '../utils/ApiResponse.js'

export const submitInquiry = asyncHandler(async (req, res) => {
  await sendInquiryEmail(req.body)
  res.status(201).json(new ApiResponse({ delivered: true }, 'Inquiry sent successfully'))
})


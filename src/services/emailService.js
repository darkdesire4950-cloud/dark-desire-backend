import axios from 'axios'
import { ApiError } from '../utils/ApiResponse.js'

const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send'

export const sendInquiryEmail = async ({ name, email, phone, company, message, subject }) => {
  const {
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    EMAILJS_PUBLIC_KEY,
    EMAILJS_PRIVATE_KEY,
  } = process.env

  if (
    !EMAILJS_SERVICE_ID ||
    !EMAILJS_TEMPLATE_ID ||
    !EMAILJS_PUBLIC_KEY ||
    !EMAILJS_PRIVATE_KEY
  ) {
    throw new ApiError(500, 'EmailJS environment variables are missing')
  }

  const templateParams = {
    from_name: name,
    reply_to: email,
    phone,
    company,
    subject: subject || 'New Inquiry',
    message,
  }

  try {
    await axios.post(EMAILJS_ENDPOINT, {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      accessToken: EMAILJS_PRIVATE_KEY,
      template_params: templateParams,
    })
  } catch (error) {
    throw new ApiError(
      error?.response?.status || 502,
      error?.response?.data?.message || 'EmailJS request failed',
    )
  }

  return { delivered: true }
}


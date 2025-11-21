import Joi from 'joi'

export const inquirySchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow('', null),
  company: Joi.string().allow('', null),
  subject: Joi.string().allow('', null),
  message: Joi.string().required(),
})


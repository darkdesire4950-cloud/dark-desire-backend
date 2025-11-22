import Joi from 'joi'

export const customizationSchema = Joi.object({
  name: Joi.string().trim().required().min(2).max(100),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().required().min(10),
  company: Joi.string().trim().allow('', null).max(100),
  country: Joi.string().trim().required().min(2).max(100),
  description: Joi.string().trim().required().min(10).max(5000),
  status: Joi.string().valid('pending', 'reviewed', 'in_progress', 'completed', 'rejected').optional(),
  notes: Joi.string().trim().allow('', null).max(1000),
})


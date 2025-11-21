import Joi from 'joi'

const baseSchema = {
  title: Joi.string().trim(),
  status: Joi.string().valid('draft', 'scheduled', 'published', 'archived'),
  products: Joi.array().items(Joi.string().hex().length(24)).default([]),
}

export const createCatalogSchema = Joi.object({
  ...baseSchema,
  title: baseSchema.title.required(),
})

export const updateCatalogSchema = Joi.object({ ...baseSchema })


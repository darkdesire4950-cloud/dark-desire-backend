import Joi from 'joi'

const mediaSchema = Joi.object({
  url: Joi.string().uri().required(),
  publicId: Joi.string().required(),
})

// Accept either a media object or a string URL
const mediaOrStringSchema = Joi.alternatives().try(
  mediaSchema,
  Joi.string().uri().allow('', null),
  Joi.string().allow('', null)
)

const specificationSchema = Joi.object({
  label: Joi.string().required(),
  value: Joi.string().required(),
})

const baseProductSchema = {
  name: Joi.string().trim(),
  category: Joi.string().trim(),
  price: Joi.string().trim(),
  status: Joi.string().valid('draft', 'scheduled', 'published', 'archived'),
  rating: Joi.number().min(0).max(5),
  reviews: Joi.number().min(0),
  stock: Joi.number().min(0),
  sku: Joi.string().allow('', null),
  primaryImage: mediaOrStringSchema,
  gallery: Joi.array().items(mediaOrStringSchema),
  description: Joi.string().allow('', null),
  features: Joi.array().items(Joi.string().trim()),
  tags: Joi.array().items(Joi.string().trim()),
  metaTitle: Joi.string().allow('', null),
  metaDescription: Joi.string().allow('', null),
  availability: Joi.string().allow('', null),
  minOrder: Joi.string().allow('', null),
  leadTime: Joi.string().allow('', null),
  specifications: Joi.array().items(specificationSchema),
}

export const createProductSchema = Joi.object({
  ...baseProductSchema,
  name: baseProductSchema.name.required(),
  category: baseProductSchema.category.required(),
})

export const updateProductSchema = Joi.object({
  ...baseProductSchema,
})


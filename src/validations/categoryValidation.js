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

const baseSchema = {
  name: Joi.string().trim(),
  slug: Joi.string().trim(),
  displayOrder: Joi.number().min(1),
  thumbnail: mediaOrStringSchema,
  heroImage: mediaOrStringSchema,
  description: Joi.string().allow('', null),
  highlights: Joi.array().items(Joi.string().trim()),
  seoKeywords: Joi.array().items(Joi.string().trim()),
}

export const createCategorySchema = Joi.object({
  ...baseSchema,
  name: baseSchema.name.required(),
  slug: baseSchema.slug.required(),
})

export const updateCategorySchema = Joi.object({ ...baseSchema })


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
  title: Joi.string().trim(),
  slug: Joi.string().trim(),
  excerpt: Joi.string().trim().allow('', null),
  content: Joi.string().allow('', null),
  featuredImage: mediaOrStringSchema,
  category: Joi.string().valid('news', 'guides', 'products', 'company'),
  tags: Joi.array().items(Joi.string().trim()),
  author: Joi.string().trim(),
  status: Joi.string().valid('draft', 'published', 'archived'),
  publishedAt: Joi.date().allow(null),
  readTime: Joi.string().trim(),
  featured: Joi.boolean(),
  metaTitle: Joi.string().trim().allow('', null),
  metaDescription: Joi.string().trim().allow('', null),
}

export const createBlogSchema = Joi.object({
  ...baseSchema,
  title: baseSchema.title.required(),
})

export const updateBlogSchema = Joi.object({ ...baseSchema })


import mongoose from 'mongoose'

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false },
)

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    excerpt: { type: String, trim: true },
    content: { type: String },
    featuredImage: mediaSchema,
    category: { 
      type: String, 
      enum: ['news', 'guides', 'products', 'company'],
      default: 'news'
    },
    tags: [{ type: String, trim: true }],
    author: { type: String, default: 'Dark Desire Team' },
    status: { 
      type: String, 
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    publishedAt: { type: Date },
    readTime: { type: String, default: '5 min read' },
    featured: { type: Boolean, default: false },
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
)

// Auto-generate slug from title if not provided
blogSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  
  next()
})

export default mongoose.model('Blog', blogSchema)


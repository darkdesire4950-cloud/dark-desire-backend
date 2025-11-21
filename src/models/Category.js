import mongoose from 'mongoose'

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false },
)

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    displayOrder: { type: Number, default: 1 },
    thumbnail: mediaSchema,
    heroImage: mediaSchema,
    description: { type: String },
    highlights: [{ type: String }],
    seoKeywords: [{ type: String }],
  },
  { timestamps: true },
)

export default mongoose.model('Category', categorySchema)


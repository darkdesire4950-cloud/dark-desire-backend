import mongoose from 'mongoose'

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false },
)

const specificationSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
)

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: String, default: 'Request Quote' },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'archived'],
      default: 'draft',
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    sku: { type: String, trim: true },
    primaryImage: mediaSchema,
    gallery: [mediaSchema],
    description: { type: String },
    features: [{ type: String }],
    tags: [{ type: String }],
    metaTitle: { type: String },
    metaDescription: { type: String },
    availability: { type: String, default: 'In Stock' },
    minOrder: { type: String },
    leadTime: { type: String },
    specifications: [specificationSchema],
  },
  { timestamps: true },
)

export default mongoose.model('Product', productSchema)


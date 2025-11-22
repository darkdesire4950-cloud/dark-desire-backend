import mongoose from 'mongoose'

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    originalName: { type: String },
  },
  { _id: false },
)

const customizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    country: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    images: [imageSchema],
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'in_progress', 'completed', 'rejected'],
      default: 'pending',
    },
    notes: { type: String },
    reviewedAt: { type: Date },
    reviewedBy: { type: String },
  },
  { timestamps: true },
)

export default mongoose.model('Customization', customizationSchema)


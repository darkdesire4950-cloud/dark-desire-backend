# AWS S3 Migration Guide

## Overview

Your backend has been successfully configured to support **both AWS S3 and Cloudinary**. This dual-storage approach allows you to:

- ✅ Keep all existing Cloudinary images working without any changes
- ✅ Store all new product images in AWS S3
- ✅ Gradually migrate old images when ready (optional)
- ✅ Delete images from either storage automatically

---

## Setup Instructions

### Step 1: Create AWS S3 Bucket

1. Sign in to [AWS Console](https://console.aws.amazon.com)
2. Go to **S3** service
3. Click **Create bucket**
4. **Bucket name**: `dark-desire-images` (or your preferred name)
5. **Region**: Choose your closest region (e.g., `us-east-1`)
6. Keep default settings → Click **Create bucket**

### Step 2: Create IAM User for S3 Access

1. Go to **IAM** service
2. Click **Users** → **Create user**
3. **Username**: `dark-desire-app`
4. On permissions page → Select **Attach policies directly**
5. Search for `AmazonS3FullAccess` → Check it
6. Click **Create user**
7. Click on the new user → **Create access key**
8. Select **Application running outside AWS** → Next
9. Download the CSV file (⚠️ **Save this securely!**)

### Step 3: Update .env File

Add these AWS credentials to your `.env`:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=dark-desire-images
```

Replace values with your actual AWS credentials from Step 2.

### Step 4: Make S3 Bucket Public (Optional)

If you want images to be publicly accessible without authentication:

1. Go to S3 bucket → **Permissions**
2. Under **Block public access** → Edit → Uncheck all boxes → Save
3. Still in Permissions → **Bucket Policy** → Edit
4. Add this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::dark-desire-images/*"
    }
  ]
}
```

5. Click **Save changes**

### Step 5: Restart Backend

```bash
npm run dev
```

You should see: `AWS S3 client configured successfully`

---

## How It Works

### Upload New Images

**Old way (Cloudinary):**
```javascript
// No longer used for new uploads
```

**New way (S3):**
```javascript
POST /api/media/single
Content-Type: multipart/form-data

file: <image file>
```

**Response:**
```json
{
  "status": 201,
  "data": {
    "url": "https://dark-desire-images.s3.us-east-1.amazonaws.com/dark-desire/1234567890-image.jpg",
    "s3Key": "dark-desire/1234567890-image.jpg",
    "mimeType": "image/jpeg",
    "source": "s3"
  }
}
```

### Store in Database

When creating a new product, use the S3 URL:

```javascript
{
  "name": "Product Name",
  "primaryImage": {
    "url": "https://dark-desire-images.s3.us-east-1.amazonaws.com/dark-desire/...",
    "s3Key": "dark-desire/..."  // Store this for deletion later
  },
  "gallery": [
    {
      "url": "https://dark-desire-images.s3.us-east-1.amazonaws.com/dark-desire/...",
      "s3Key": "dark-desire/..."
    }
  ]
}
```

### Existing Cloudinary Images

All existing product images stored as Cloudinary URLs will continue to work:

```javascript
{
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v123/abc123.jpg",
  "publicId": "abc123"
}
```

No changes needed! The system auto-detects and handles deletion appropriately.

### Delete Images

The delete endpoint automatically detects the source:

```javascript
// Auto-detect (recommended)
DELETE /api/media/{identifier}

// If it's a Cloudinary URL → deletes from Cloudinary
// If it's an S3 URL → deletes from S3

// Explicit source (optional)
DELETE /api/media/{s3-key}?source=s3
DELETE /api/media/{public-id}?source=cloudinary
```

---

## File Structure Changes

### New Files
- `src/config/aws.js` - AWS S3 configuration and utilities

### Modified Files
- `package.json` - Added `@aws-sdk/client-s3` and `multer-s3`
- `src/services/mediaService.js` - Now supports both S3 and Cloudinary
- `src/controllers/mediaController.js` - Updated for S3 responses
- `src/server.js` - Initializes AWS on startup
- `SETUP_GUIDE.md` - Updated with AWS setup instructions

---

## Important Changes

### Database Schema

The `media` object in Product model now stores:

**S3 images:**
```javascript
{
  url: "https://bucket.s3.region.amazonaws.com/dark-desire/...",
  s3Key: "dark-desire/..."  // For deletion
}
```

**Cloudinary images (old):**
```javascript
{
  url: "https://res.cloudinary.com/...",
  publicId: "..."  // For deletion
}
```

Both work seamlessly - the system auto-detects which one it is.

### API Response Changes

**Old (Cloudinary):**
```json
{
  "url": "...",
  "publicId": "...",
  "mimeType": "..."
}
```

**New (S3):**
```json
{
  "url": "...",
  "s3Key": "...",
  "mimeType": "...",
  "source": "s3"
}
```

Your frontend code should handle both formats (they're backwards compatible).

---

## Optional: Migrate Old Cloudinary Images

When you're ready to move all old images from Cloudinary to S3:

1. **Script to download & re-upload** (run once):
```javascript
// Get all products with Cloudinary images
// Download from Cloudinary
// Upload to S3
// Update database URLs
// Delete from Cloudinary
```

This can be done gradually per product or batch-wise. The current setup allows infinite time for migration since both sources work.

---

## Environment Variables Summary

```env
# AWS S3 (NEW - for new uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket-name

# Cloudinary (KEEP - for existing images)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## Testing

### Test S3 Upload
```bash
curl -X POST http://localhost:5000/api/media/single \
  -F "file=@/path/to/image.jpg"
```

Should return S3 URL.

### Test Cloudinary URLs Still Work
Visit any old product with Cloudinary image - should display fine.

### Test Deletion
```bash
# Delete S3 image
curl -X DELETE http://localhost:5000/api/media/dark-desire/timestamp-filename

# Delete Cloudinary image (auto-detected)
curl -X DELETE http://localhost:5000/api/media/public-id
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| AWS credentials error | Double-check credentials in `.env` |
| S3 bucket not found | Verify bucket name and region match |
| 403 Forbidden on S3 URL | Enable public access on bucket |
| Old Cloudinary images 404 | Keep Cloudinary credentials in `.env` |
| Images not uploading | Check S3 bucket permissions |

---

## Support

If you encounter issues:
1. Check backend logs with `npm run dev`
2. Verify `.env` file has all required AWS variables
3. Confirm S3 bucket is created and accessible
4. Check AWS IAM user has `AmazonS3FullAccess` policy

---

**Migration is complete! You can now:**
- ✅ Upload new product images to AWS S3
- ✅ Keep using existing Cloudinary images
- ✅ Delete images from either storage
- ✅ Gradually migrate old images when ready

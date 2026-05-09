# AWS S3 Migration - Implementation Checklist

✅ **All backend changes have been implemented**

## Files Created/Modified

### ✅ New Files
- **[src/config/aws.js](src/config/aws.js)** - AWS S3 configuration and utilities
- **[AWS_S3_MIGRATION.md](AWS_S3_MIGRATION.md)** - Comprehensive migration guide
- **[src/utils/storageHelper.js](src/utils/storageHelper.js)** - Frontend helper utilities

### ✅ Modified Files
- **[package.json](package.json)** - Added AWS SDK and multer-s3 packages
- **[src/services/mediaService.js](src/services/mediaService.js)** - Dual storage support
- **[src/controllers/mediaController.js](src/controllers/mediaController.js)** - S3 response handling
- **[src/server.js](src/server.js)** - AWS initialization
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - AWS setup instructions

---

## What You Need To Do

### Step 1: Install Dependencies
```bash
cd /Users/macbookpro/Documents/dark\ desire/DarkDesire-Backend/dark-desire-backend
npm install
```

This will install:
- `@aws-sdk/client-s3` - AWS S3 client
- `multer-s3` - Multer S3 storage adapter

### Step 2: Create AWS S3 Bucket & IAM User

Follow the detailed steps in [AWS_S3_MIGRATION.md](AWS_S3_MIGRATION.md#step-1-create-aws-s3-bucket):

1. **Create S3 Bucket:**
   - Bucket name: `dark-desire-images` (or your choice)
   - Region: `us-east-1` (or your region)

2. **Create IAM User:**
   - Username: `dark-desire-app`
   - Attach `AmazonS3FullAccess` policy
   - Generate access keys
   - **Save the credentials CSV file**

3. **Make Bucket Public (Optional):**
   - Unblock public access
   - Add bucket policy to allow public `GetObject`

### Step 3: Add AWS Credentials to .env

Update your `.env` file with AWS credentials:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY_HERE
AWS_S3_BUCKET=dark-desire-images
```

**Keep your existing Cloudinary credentials:**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 4: Start Backend
```bash
npm run dev
```

Should show:
```
AWS S3 client configured successfully
Admin API running on port 5000
```

### Step 5: Test Upload Endpoints

**Test S3 upload:**
```bash
curl -X POST http://localhost:5000/api/media/single \
  -F "file=@/path/to/image.jpg"
```

Expected response:
```json
{
  "status": 201,
  "data": {
    "url": "https://dark-desire-images.s3.us-east-1.amazonaws.com/...",
    "s3Key": "dark-desire/...",
    "source": "s3"
  }
}
```

**Verify old Cloudinary images still work:**
- Check any existing product with Cloudinary URL
- Should display without errors

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│          Frontend/Admin Panel                   │
└────────────────┬────────────────────────────────┘
                 │
     ┌───────────┴────────────┐
     │                        │
     ▼                        ▼
┌──────────────┐      ┌────────────────┐
│  AWS S3      │      │  Cloudinary    │
│ NEW IMAGES   │      │ LEGACY IMAGES  │
└──────────────┘      └────────────────┘
     ▲                        ▲
     │                        │
     └───────────┬────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │  Backend API       │
        │  (src/services/)   │
        │                    │
        │ • mediaService.js  │
        │ • auto-detection   │
        │ • dual deletion    │
        └────────────────────┘
                 ▲
                 │
        ┌────────┴─────────┐
        │                  │
        ▼                  ▼
   ┌────────────┐    ┌──────────────┐
   │  MongoDB   │    │  Product DB  │
   │ (Media     │    │  (Store      │
   │  Objects)  │    │   URLs & Keys)
   └────────────┘    └──────────────┘
```

---

## Feature Breakdown

### ✅ New Product Uploads
- Upload → Multer with S3 storage → S3 bucket
- Response includes `s3Key` for future deletion
- Store full URL and S3 key in database

### ✅ Legacy Cloudinary Images
- No changes to existing images
- Auto-detected by system
- Continue to display and function
- Can be deleted via auto-detection

### ✅ Image Deletion
- **Auto-detect:** `DELETE /api/media/{identifier}`
- **Explicit:** `DELETE /api/media/{identifier}?source=s3|cloudinary`
- Works for both S3 and Cloudinary

### ✅ Frontend Storage Helper
- [src/utils/storageHelper.js](src/utils/storageHelper.js) provided
- Detect image source (S3 vs Cloudinary)
- Extract identifiers for deletion
- Normalize media objects

---

## Database Schema (No Changes Needed!)

Your existing Product schema works as-is:

```javascript
mediaSchema = {
  url: String,           // Works for both S3 and Cloudinary URLs
  publicId: String,      // For Cloudinary (optional)
  s3Key: String         // For S3 (optional)
}
```

**S3 images stored as:**
```json
{
  "url": "https://bucket.s3.region.amazonaws.com/dark-desire/...",
  "s3Key": "dark-desire/..."
}
```

**Cloudinary images stored as (unchanged):**
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "public_id"
}
```

---

## Migration Timeline

### Now (Immediate)
- ✅ Code changes implemented
- [ ] Install dependencies (`npm install`)
- [ ] Create AWS S3 bucket
- [ ] Create IAM user with S3 access
- [ ] Add AWS credentials to `.env`
- [ ] Start backend and test

### This Week
- [ ] Test new product uploads (go to S3)
- [ ] Verify old Cloudinary images display
- [ ] Test image deletion
- [ ] Update admin panel to use new S3 URLs

### This Month (Optional)
- [ ] Create migration script for old images
- [ ] Gradually move Cloudinary → S3
- [ ] Update database references

### No Deadline (Future)
- [ ] Delete unused Cloudinary images
- [ ] Optimize S3 images via Lambda
- [ ] Add CloudFront CDN in front of S3

---

## Troubleshooting

### Issue: AWS credentials error on startup
**Solution:** Double-check `.env` file has all required AWS variables

### Issue: S3 upload returns 403 Forbidden
**Solution:** 
- Verify bucket name matches `AWS_S3_BUCKET`
- Check region matches `AWS_REGION`
- Verify IAM user has `AmazonS3FullAccess`

### Issue: S3 URL returns 403 when accessing image
**Solution:** Enable public access on S3 bucket

### Issue: Old Cloudinary images show 404
**Solution:** Keep Cloudinary credentials in `.env` - don't remove them

### Issue: Module not found `@aws-sdk/client-s3`
**Solution:** Run `npm install` to install new dependencies

---

## Code References

### AWS Configuration
See [src/config/aws.js](src/config/aws.js):
- `configureAWS()` - Initialize S3 client
- `uploadToS3()` - Upload file
- `deleteFromS3()` - Delete file

### Media Service
See [src/services/mediaService.js](src/services/mediaService.js):
- `isCloudinaryUrl()` - Detect if URL is Cloudinary
- `deleteAsset()` - Delete from S3 or Cloudinary
- Auto-detection logic

### Media Controller
See [src/controllers/mediaController.js](src/controllers/mediaController.js):
- Returns S3 URLs with `s3Key` for deletion
- Still supports Cloudinary responses

### Storage Utilities
See [src/utils/storageHelper.js](src/utils/storageHelper.js):
- Frontend helper functions
- Detect storage source
- Normalize media objects
- Extract identifiers for deletion

---

## Next Steps

### For Backend
1. [ ] Run `npm install`
2. [ ] Create AWS S3 bucket
3. [ ] Generate IAM credentials
4. [ ] Update `.env` with AWS credentials
5. [ ] Test with `npm run dev`

### For Frontend
1. [ ] Update upload handlers to use new S3 URLs
2. [ ] Import `StorageUtil` from `src/utils/storageHelper.js`
3. [ ] Update delete handlers for auto-detection
4. [ ] Test with old and new images

---

**Your backend is now ready for AWS S3 migration! 🚀**

All code changes are complete. You just need to create the AWS bucket and add credentials.

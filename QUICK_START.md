# Quick Reference - Cloudinary to AWS S3 Migration

## TL;DR - What You Need to Do

1. **Create AWS S3 bucket**: `dark-desire-images`
2. **Create IAM user** with `AmazonS3FullAccess`
3. **Add to `.env`**:
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_S3_BUCKET=dark-desire-images
   ```
4. **Run**: `npm install && npm run dev`
5. **Done!** New images go to S3, old Cloudinary images still work

---

## File Changes Summary

| File | Change | Why |
|------|--------|-----|
| `package.json` | Added `@aws-sdk/client-s3` + `multer-s3` | AWS dependencies |
| `src/config/aws.js` | **NEW** | S3 configuration |
| `src/services/mediaService.js` | Updated for dual storage | S3 + Cloudinary support |
| `src/controllers/mediaController.js` | Updated response format | Handle S3 responses |
| `src/server.js` | Added AWS init | Configure S3 on startup |
| `src/utils/storageHelper.js` | **NEW** | Frontend utilities |
| `SETUP_GUIDE.md` | Added AWS section | Documentation |

---

## Environment Variables

```env
# ADD THESE NEW VARIABLES
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=dark-desire-images

# KEEP THESE EXISTING VARIABLES (for legacy images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## API Changes

### Upload Endpoint (No URL change)
```
POST /api/media/single
POST /api/media/multiple
```

**OLD Response (Cloudinary):**
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "...",
  "mimeType": "image/jpeg"
}
```

**NEW Response (S3):**
```json
{
  "url": "https://bucket.s3.region.amazonaws.com/...",
  "s3Key": "dark-desire/...",
  "mimeType": "image/jpeg",
  "source": "s3"
}
```

### Delete Endpoint (More powerful now)
```
DELETE /api/media/{identifier}
```
- **Auto-detects** if identifier is S3 key or Cloudinary public ID
- Works for both old and new images
- Optional: `?source=s3` or `?source=cloudinary` to force

---

## Database Storage

### New S3 Images
```javascript
{
  "primaryImage": {
    "url": "https://bucket.s3.us-east-1.amazonaws.com/dark-desire/...",
    "s3Key": "dark-desire/..."  // ← Store this!
  }
}
```

### Old Cloudinary Images (No changes)
```javascript
{
  "primaryImage": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "..."
  }
}
```

**Both work together seamlessly!**

---

## Testing Checklist

- [ ] `npm install` runs successfully
- [ ] `npm run dev` shows "AWS S3 client configured"
- [ ] Can upload new image to `/api/media/single`
- [ ] New image stored in AWS S3 bucket
- [ ] Old Cloudinary images still display
- [ ] Can delete both S3 and Cloudinary images
- [ ] Product CRUD operations work

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `AWS configuration error` | Check all 4 AWS vars in `.env` |
| `S3 bucket not found` | Verify bucket name & region |
| `403 Forbidden on S3 URL` | Enable public access on bucket |
| `Module not found` | Run `npm install` |
| `Old images 404` | Keep Cloudinary credentials |

---

## Frontend Changes (If Using)

Import the storage helper:
```javascript
import { StorageUtil } from './src/utils/storageHelper.js'

// Detect image source
const source = StorageUtil.detectStorageSource(imageUrl)

// Delete (works for both S3 and Cloudinary)
const deleteUrl = StorageUtil.getDeleteEndpoint(imageUrl)
await fetch(deleteUrl.endpoint, { method: 'DELETE' })
```

---

## Timeline

- **Now**: Setup AWS bucket & credentials
- **Today**: Run `npm install` & test
- **This week**: Verify all uploads go to S3
- **This month**: Optional - migrate old images
- **Later**: Optional - add CDN/optimization

---

## Key Differences

| Aspect | Cloudinary | AWS S3 |
|--------|-----------|--------|
| **Cost** | Free tier 25 GB | Free tier 1 year |
| **URL** | `res.cloudinary.com` | `bucket.s3.region.amazonaws.com` |
| **Setup** | Simple | More steps |
| **Performance** | CDN included | Need CloudFront |
| **Control** | Less | Full control |

---

## Files to Read

1. **[AWS_S3_MIGRATION.md](AWS_S3_MIGRATION.md)** - Full setup guide
2. **[MIGRATION_CHECKLIST.md](MIGRATION_CHECKLIST.md)** - Detailed checklist
3. **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - General backend setup
4. **[src/config/aws.js](src/config/aws.js)** - AWS code
5. **[src/utils/storageHelper.js](src/utils/storageHelper.js)** - Frontend utilities

---

## Support Files

- ✅ AWS configuration: `src/config/aws.js`
- ✅ Media service: `src/services/mediaService.js`
- ✅ Media controller: `src/controllers/mediaController.js`
- ✅ Storage utilities: `src/utils/storageHelper.js`
- ✅ Migration guide: `AWS_S3_MIGRATION.md`
- ✅ Checklist: `MIGRATION_CHECKLIST.md`

---

**Everything is ready! Just create the AWS bucket and update .env** 🚀

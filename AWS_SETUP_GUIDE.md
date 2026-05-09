# AWS S3 Setup - Visual Step-by-Step Guide

## Step 1: Create S3 Bucket

### 1.1 Login to AWS Console
- Go to: https://console.aws.amazon.com
- Sign in with your AWS account
- Search for "S3" in the search bar

### 1.2 Create Bucket
```
S3 Dashboard → Create Bucket
├─ Bucket name: dark-desire-images
├─ Region: us-east-1 (or your preferred region)
├─ Block all public access: ☐ (uncheck if you want public URLs)
└─ Create Bucket ✓
```

### 1.3 Bucket Created ✓
You now have your S3 bucket ready!

---

## Step 2: Create IAM User for S3 Access

### 2.1 Navigate to IAM
```
AWS Console Search → "IAM" → Click on IAM service
```

### 2.2 Create User
```
Left Sidebar → Users → Create user
├─ User name: dark-desire-app
├─ Provide user access to AWS Management Console: ☐ (optional)
├─ I want to create an IAM user: ✓
└─ Next ✓
```

### 2.3 Set Permissions
```
Set permissions page
├─ Attach policies directly: ✓ (selected)
├─ Search: AmazonS3FullAccess
├─ ☑ AmazonS3FullAccess (check this)
└─ Next ✓
```

### 2.4 Review & Create
```
Review page
├─ User name: dark-desire-app
├─ Permissions: AmazonS3FullAccess
└─ Create user ✓
```

### 2.5 Create Access Keys
```
User Details → Security credentials tab
├─ Access keys section
├─ Create access key ✓
├─ Use case: Application running outside AWS ✓
├─ Next ✓
└─ Create access key ✓
```

### 2.6 Download Keys
```
⚠️ IMPORTANT: Download the CSV file or copy:
├─ Access Key ID: AKIA...
└─ Secret Access Key: wJal...

⚠️ You won't see this again! Save it securely!
```

---

## Step 3: Make Bucket Public (Optional but Recommended)

### 3.1 Open Bucket
```
S3 Dashboard → Buckets → Click on "dark-desire-images"
```

### 3.2 Edit Block Public Access
```
Permissions tab
├─ Block public access (bucket settings)
├─ Edit ✓
├─ ☐ Block all public access (UNCHECK)
├─ ☑ I acknowledge... (check this)
└─ Save changes ✓
```

### 3.3 Add Bucket Policy
```
Still in Permissions tab
├─ Bucket policy section
├─ Edit ✓
├─ Copy & paste this policy:

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

└─ Save changes ✓
```

---

## Step 4: Update .env File

### 4.1 Open .env
```bash
cd /Users/macbookpro/Documents/dark\ desire/DarkDesire-Backend/dark-desire-backend
nano .env  # or use your editor
```

### 4.2 Add AWS Credentials
```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...             # From Step 2.6
AWS_SECRET_ACCESS_KEY=wJal...         # From Step 2.6
AWS_S3_BUCKET=dark-desire-images      # From Step 1.2
```

### 4.3 Keep Cloudinary Credentials
```env
# Don't remove these! Needed for existing images
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4.4 Save & Exit
```
Ctrl + O → Enter → Ctrl + X (nano)
```

---

## Step 5: Install & Test

### 5.1 Install Dependencies
```bash
npm install
```

Expected output:
```
added X packages, Y vulnerabilities...
```

### 5.2 Start Backend
```bash
npm run dev
```

Expected output:
```
AWS S3 client configured successfully
Admin API running on port 5000
```

### 5.3 Test Upload
```bash
curl -X POST http://localhost:5000/api/media/single \
  -F "file=@/path/to/test-image.jpg"
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

✅ **Success!** Image is now in S3!

---

## Verify Setup

### Check Bucket
```
AWS Console → S3 → dark-desire-images
├─ Objects tab
└─ You should see your uploaded images here
```

### Check URL Works
```
Copy the URL from API response
Paste in browser
You should see the image!
```

---

## AWS Console Overview

```
AWS Management Console
├─ Search Bar (top)
│  └─ Type "S3" or "IAM"
│
├─ S3 Service
│  ├─ Buckets (left sidebar)
│  │  └─ dark-desire-images (your bucket)
│  │     ├─ Objects (see your files here)
│  │     └─ Permissions (manage access)
│  │
│  └─ Useful links:
│     ├─ Bucket name: dark-desire-images
│     ├─ Region: us-east-1
│     └─ URL format: https://[bucket].s3.[region].amazonaws.com/[key]
│
└─ IAM Service
   ├─ Users (left sidebar)
   │  └─ dark-desire-app
   │     ├─ Summary (see user details)
   │     ├─ Security credentials (manage keys)
   │     └─ Permissions (see AmazonS3FullAccess)
   │
   └─ Useful info:
      ├─ User ARN: arn:aws:iam::ACCOUNT:user/dark-desire-app
      └─ Access Key ID: AKIA...
```

---

## Environment Variables Mapping

```
AWS Console             .env Variable           Used For
────────────────────────────────────────────────────────────
Region: us-east-1  →   AWS_REGION              S3 region
Access Key ID      →   AWS_ACCESS_KEY_ID       Auth
Secret Access Key  →   AWS_SECRET_ACCESS_KEY   Auth
Bucket: dark-...   →   AWS_S3_BUCKET           Storage
```

---

## Troubleshooting

### Problem: "Access Denied" when uploading
**Solution:**
```
✓ Verify AWS_ACCESS_KEY_ID is correct
✓ Verify AWS_SECRET_ACCESS_KEY is correct
✓ Verify IAM user has AmazonS3FullAccess
✓ Restart backend after .env changes
```

### Problem: "NoSuchBucket" error
**Solution:**
```
✓ Verify bucket name is correct: dark-desire-images
✓ Verify AWS_REGION matches bucket region
✓ Check bucket exists in AWS console
```

### Problem: 403 Forbidden when accessing image URL
**Solution:**
```
✓ Verify Block public access is UNCHECKED
✓ Verify bucket policy allows s3:GetObject
✓ Wait a few seconds (permissions propagate)
✓ Try private URL with credentials
```

### Problem: "Module not found @aws-sdk"
**Solution:**
```bash
npm install
npm run dev
```

---

## Security Best Practices

✅ **Do:**
- Save access keys securely (password manager)
- Use IAM user (not root account)
- Give minimal permissions (AmazonS3FullAccess is fine)
- Rotate keys periodically
- Keep .env file out of version control

❌ **Don't:**
- Commit .env to GitHub
- Share access keys
- Use root account credentials
- Enable public upload (only GetObject)
- Store keys in code

---

## Cost Estimation

### Free Tier (First 12 months)
```
Storage:        5 GB free
PUT requests:   2,000 free
GET requests:   20,000 free
Data transfer:  100 GB free
```

### After Free Tier
```
Storage:        ~$0.023 per GB/month
PUT requests:   ~$0.005 per 1,000
GET requests:   ~$0.0004 per 1,000
Data transfer:  ~$0.09 per GB
```

**Estimate for small site:**
```
100 products × 3 images × 2 MB = 600 MB
Uptime 24/7, visitors accessing images
Monthly cost: ~$0.20 - $1.00
```

---

## Reference URLs

| Task | URL |
|------|-----|
| AWS Console | https://console.aws.amazon.com |
| S3 Dashboard | https://console.aws.amazon.com/s3 |
| IAM Dashboard | https://console.aws.amazon.com/iam |
| AWS S3 Docs | https://docs.aws.amazon.com/s3/ |
| AWS Pricing | https://aws.amazon.com/s3/pricing/ |

---

## Checklist

```
AWS Setup Checklist:

□ Created S3 bucket: dark-desire-images
□ Selected region: us-east-1
□ Created IAM user: dark-desire-app
□ Attached AmazonS3FullAccess policy
□ Generated access keys
□ Downloaded credentials CSV
□ Unblocked public access (if wanted)
□ Added bucket policy (if wanted)
□ Updated .env with 4 AWS variables
□ Ran npm install
□ Backend shows "AWS S3 configured"
□ Tested image upload
□ Image appears in S3 bucket
□ Image URL works in browser

All done! ✓
```

---

## Next: Test Your Setup

1. Create a test product via API
2. Upload an image
3. Verify it's in S3 console
4. Verify URL works
5. Verify old Cloudinary images still work
6. Verify deletion works

**You're ready to go!** 🚀

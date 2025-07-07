# MinIO Setup for Outline on Railway

## Setting up MinIO Bucket

After deploying MinIO on Railway, you need to create the bucket for Outline. Here are two methods:

### Method 1: Using MinIO Console (Recommended)

1. In Railway, find your MinIO service
2. Click on the MinIO service and go to Settings → Networking
3. Generate a domain for the MinIO service
4. Visit the domain URL in your browser
5. Login with:
   - Username: Value of `MINIO_ROOT_USER`
   - Password: Value of `MINIO_ROOT_PASSWORD`
6. Create a new bucket named `outline-uploads`
7. Set bucket policy to allow public read access for the bucket

### Method 2: Using MinIO Client (mc)

Install MinIO client locally and run:

```bash
# Configure MinIO client
mc alias set railway https://your-minio-domain.up.railway.app $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

# Create bucket
mc mb railway/outline-uploads

# Set bucket policy for public read
mc anonymous set download railway/outline-uploads
```

## Configuring Outline for MinIO

Ensure these environment variables are set in your Outline Railway service:

```
FILE_STORAGE=s3
AWS_ACCESS_KEY_ID=${{MINIO_ROOT_USER}}
AWS_SECRET_ACCESS_KEY=${{MINIO_ROOT_PASSWORD}}
AWS_REGION=us-east-1
AWS_S3_UPLOAD_BUCKET_NAME=outline-uploads
AWS_S3_UPLOAD_BUCKET_URL=https://your-outline-app.up.railway.app/storage
AWS_S3_UPLOAD_MAX_SIZE=26214400
AWS_S3_FORCE_PATH_STYLE=true
AWS_S3_ACL=private
AWS_ENDPOINT_URL=http://minio.railway.internal:9000
```

## Important Notes

1. **Internal URL**: Use `http://minio.railway.internal:9000` for service-to-service communication
2. **Path Style**: MinIO requires `AWS_S3_FORCE_PATH_STYLE=true`
3. **Bucket URL**: Should point to your Outline app's public URL with `/storage` path
4. **Max Upload Size**: Set to 25MB (26214400 bytes) by default, adjust as needed

## Troubleshooting

### Files not uploading
- Check MinIO service is running
- Verify bucket exists
- Check environment variables are correctly set
- Look at Outline logs for S3 connection errors

### Files not accessible
- Verify `AWS_S3_UPLOAD_BUCKET_URL` points to correct public URL
- Check bucket permissions allow public read
- Ensure Outline is properly proxying storage requests

### Connection errors
- Verify `minio.railway.internal` is accessible from Outline service
- Check both services are in the same Railway project
- Ensure MinIO credentials match between services
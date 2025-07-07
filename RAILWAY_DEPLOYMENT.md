# Railway Deployment Guide for Outline

This guide will help you deploy Outline wiki on Railway with PostgreSQL and Redis.

## Prerequisites

1. A Railway account (https://railway.app)
2. At least one OAuth provider configured (Google, Slack, Microsoft, or Discord)
3. (Optional) SMTP credentials for email notifications

## Deployment Steps

### 1. Create Railway Project

1. Log in to Railway
2. Create a new project
3. Choose "Deploy from GitHub repo" and select your forked Outline repository

### 2. Add Database Services

#### PostgreSQL
1. In your Railway project, click "New Service"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create a `DATABASE_URL` variable

#### Redis
1. Click "New Service" again
2. Select "Database" → "Add Redis"
3. Railway will automatically create a `REDIS_URL` variable

### 3. Configure Environment Variables

In your Railway project settings, add these environment variables:

#### Required Core Variables

```bash
# Application Settings
NODE_ENV=production
URL=https://your-app-name.up.railway.app  # Replace with your Railway URL
PORT=${{PORT}}  # Railway provides this automatically

# Security Keys (Generate these!)
SECRET_KEY=<generate with: openssl rand -hex 32>
UTILS_SECRET=<generate with: openssl rand -hex 32>

# Database (Railway provides these automatically)
DATABASE_URL=${{DATABASE_URL}}
REDIS_URL=${{REDIS_URL}}

# For Railway's PostgreSQL
PGSSLMODE=require
```

#### Authentication (Choose at least ONE)

**Option 1: Google OAuth**
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```
Setup: https://docs.getoutline.com/s/hosting/doc/google-hOuvtCmTqQ

**Option 2: Slack OAuth**
```bash
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
```
Setup: https://docs.getoutline.com/s/hosting/doc/slack-sgMujR8J9J

**Option 3: Microsoft/Azure AD**
```bash
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret
AZURE_RESOURCE_APP_ID=your_resource_app_id
```
Setup: https://docs.getoutline.com/s/hosting/doc/microsoft-entra-UVz6jsIOcv

**Option 4: Discord**
```bash
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_SERVER_ID=your_server_id  # Optional
```
Setup: https://docs.getoutline.com/s/hosting/doc/discord-g4JdWFFub6

#### Optional: Email Configuration

For email notifications (password resets, document updates, etc.):

**Using a Well-known Service (e.g., Gmail, SendGrid)**
```bash
SMTP_SERVICE=gmail  # or sendgrid, mailgun, etc.
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
SMTP_FROM_EMAIL=notifications@yourdomain.com
```

**Using Custom SMTP**
```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your_username
SMTP_PASSWORD=your_password
SMTP_FROM_EMAIL=notifications@yourdomain.com
SMTP_SECURE=true
```

#### Optional: File Storage

By default, files are stored locally. For production, consider S3:

```bash
FILE_STORAGE=s3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_UPLOAD_BUCKET_NAME=your-outline-bucket
AWS_S3_UPLOAD_BUCKET_URL=https://your-bucket.s3.amazonaws.com
AWS_S3_FORCE_PATH_STYLE=false
AWS_S3_ACL=private
```

### 4. Deploy

1. After setting all environment variables, Railway will automatically deploy
2. Monitor the deployment logs for any errors
3. The database migrations will run automatically on first deploy

### 5. Access Your Instance

1. Once deployed, visit your Railway-provided URL
2. You'll be redirected to sign in with your configured OAuth provider
3. The first user to sign in becomes the admin

## Troubleshooting

### Common Issues

1. **"No authentication providers configured"**
   - Ensure you've set up at least one OAuth provider correctly
   - Check that client ID and secret are properly set

2. **Database connection errors**
   - Verify `DATABASE_URL` is using Railway's PostgreSQL variable reference
   - Ensure `PGSSLMODE=require` is set

3. **Redis connection errors**
   - Verify `REDIS_URL` is using Railway's Redis variable reference

4. **File upload issues**
   - For local storage, Railway provides ephemeral storage
   - Consider configuring S3 for persistent file storage

### Logs

Monitor logs in Railway dashboard:
- Web service logs for application errors
- Database logs for connection issues

## Security Notes

1. Always use strong, randomly generated values for `SECRET_KEY` and `UTILS_SECRET`
2. Enable 2FA on your Railway account
3. Regularly update Outline to get security patches
4. Configure rate limiting (enabled by default)

## Next Steps

1. Configure additional OAuth providers for redundancy
2. Set up email for better user experience
3. Configure S3 for scalable file storage
4. Set up custom domain in Railway settings
5. Enable automatic backups for PostgreSQL

## Support

- Outline Documentation: https://docs.getoutline.com
- Railway Documentation: https://docs.railway.app
- Outline Community: https://github.com/outline/outline/discussions
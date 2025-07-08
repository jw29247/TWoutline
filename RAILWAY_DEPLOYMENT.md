# Railway Deployment Guide for Outline

This guide walks you through deploying Outline to Railway.com with all necessary services.

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository connected to Railway
- At least one OAuth provider credentials (Google, Slack, Microsoft, or Discord)
- Domain configured for Resend email (optional but recommended)

## Step 1: Create Railway Project

1. Log in to Railway dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your Outline repository
5. Railway will automatically detect the `railway.json` configuration

Note: The `railway.json` file configures the Outline service to use `Dockerfile.railway` which builds the entire application from source. Additional services (PostgreSQL, Redis, MinIO) must be added separately through the Railway dashboard.

## Step 2: Add Required Services

### PostgreSQL Database
1. In your Railway project, click "New Service"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically provide `DATABASE_URL`

### Redis
1. Click "New Service" again
2. Select "Database" → "Add Redis"
3. Railway will automatically provide `REDIS_URL`

### File Storage Options

#### Option A: Railway Volume (Simpler, up to 50GB)
1. In your Outline service settings, go to "Volumes"
2. Create a new volume with mount path: `/var/lib/outline/data`
3. Use `FILE_STORAGE=local` in environment variables

#### Option B: MinIO Object Storage (Scalable, S3-compatible)
1. Click "New Service"
2. Select "Template" → Search for "MinIO"
3. Deploy the MinIO template
4. Note the MinIO service variables:
   - `MINIO_ROOT_USER` (access key)
   - `MINIO_ROOT_PASSWORD` (secret key)
   - Internal URL: `http://minio.railway.internal:9000`
5. After MinIO deploys, create a bucket named `outline-uploads` (see MINIO_SETUP.md for detailed instructions)

## Step 3: Configure Environment Variables

In your Railway project settings, add these environment variables:

### Core Configuration (Required)
```
NODE_ENV=production
URL=https://your-app-name.up.railway.app
SECRET_KEY=<generate with: openssl rand -hex 32>
UTILS_SECRET=<generate with: openssl rand -hex 32>
FORCE_HTTPS=true
```

Note: Railway automatically provides the PORT variable. Do not set it manually.

### Database Configuration (Auto-configured by Railway)
```
DATABASE_URL=${{DATABASE_URL}}
DATABASE_CONNECTION_POOL_MIN=2
DATABASE_CONNECTION_POOL_MAX=10
PGSSLMODE=require
```

### Redis Configuration (Auto-configured by Railway)
```
REDIS_URL=${{REDIS_URL}}
```

### Authentication (Choose at least one)

#### Google OAuth
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Slack OAuth
```
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
```

#### Microsoft/Azure AD
```
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_RESOURCE_APP_ID=your-azure-resource-app-id
```

#### Discord OAuth
```
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
DISCORD_SERVER_ID=your-discord-server-id
```

### Email Configuration with Resend (Recommended)

1. Sign up for Resend at https://resend.com
2. Create an API key
3. Add these environment variables:

```
SMTP_SERVICE=resend
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USERNAME=resend
SMTP_PASSWORD=<your-resend-api-key>
SMTP_FROM_EMAIL=notifications@yourdomain.com
SMTP_REPLY_EMAIL=support@yourdomain.com
SMTP_SECURE=true
```

### File Storage Configuration

#### Option A: Railway Volume (Recommended for simplicity)
```
FILE_STORAGE=local
FILE_STORAGE_LOCAL_ROOT_DIR=/var/lib/outline/data
```

#### Option B: MinIO S3-Compatible Storage (Recommended for scale)
```
FILE_STORAGE=s3
AWS_ACCESS_KEY_ID=${{MINIO_ROOT_USER}}
AWS_SECRET_ACCESS_KEY=${{MINIO_ROOT_PASSWORD}}
AWS_REGION=us-west1
AWS_S3_UPLOAD_BUCKET_NAME=outline-uploads
AWS_S3_UPLOAD_BUCKET_URL=https://your-app-name.up.railway.app/storage
AWS_S3_UPLOAD_MAX_SIZE=26214400
AWS_S3_FORCE_PATH_STYLE=true
AWS_S3_ACL=private
AWS_ENDPOINT_URL=http://minio.railway.internal:9000
```

Note: For MinIO, the `AWS_S3_UPLOAD_BUCKET_URL` should point to your public URL with `/storage` path.

### Optional Features
```
# Sentry error tracking
SENTRY_DSN=your-sentry-dsn

# Rate limiting
RATE_LIMITER_ENABLED=true
RATE_LIMITER_REQUESTS=1000
RATE_LIMITER_DURATION_WINDOW=60

# Collaboration
COLLABORATION_URL=wss://your-app-name.up.railway.app

# Development/Debug (set to false in production)
DEBUG=false
```

## Step 4: Deploy

1. After configuring all environment variables, Railway will automatically deploy
2. Monitor the build logs in Railway dashboard
3. Check the deployment logs for any startup errors
4. The health check at `/_health` must pass (requires DB and Redis)
5. Once deployed, visit your URL to complete setup

### Debugging Deployment Issues

If the deployment fails or health checks don't pass:

1. Check the logs in Railway dashboard
2. Run the environment check locally: `node check-env.js`
3. Ensure PostgreSQL and Redis services are running
4. Verify all required environment variables are set
5. Confirm at least one auth provider is configured

## Step 5: Initial Setup

### Option A: Using OAuth Provider (Standard)
1. Navigate to your Outline URL
2. Sign in with your configured OAuth provider
3. Complete the initial workspace setup
4. Configure teams and permissions as needed

### Option B: Using Installation Wizard (No OAuth)
If you haven't configured OAuth providers yet or need to reset:

1. Add this environment variable in Railway:
   ```
   FORCE_SETUP_MODE=true
   ```
2. Redeploy your service
3. Visit your Railway URL - you'll see the installation wizard
4. Enter your workspace name and admin user details
5. Complete the setup
6. **Important**: Remove `FORCE_SETUP_MODE` from Railway and redeploy

This setup mode is useful when:
- Setting up a fresh instance without OAuth
- You need to create the first admin user manually
- OAuth providers aren't working correctly

## Setting Up OAuth Providers

### Google OAuth Setup
1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-app-name.up.railway.app/auth/google.callback`

### Slack OAuth Setup
1. Go to https://api.slack.com/apps
2. Create a new app
3. Add OAuth redirect URL: `https://your-app-name.up.railway.app/auth/slack.callback`
4. Add required scopes: `identity.avatar`, `identity.basic`, `identity.team`, `identity.email`

### Microsoft/Azure AD Setup
1. Go to https://portal.azure.com
2. Register a new application
3. Add redirect URI: `https://your-app-name.up.railway.app/auth/azure.callback`
4. Create a client secret

### Discord OAuth Setup
1. Go to https://discord.com/developers/applications
2. Create a new application
3. Add redirect URI: `https://your-app-name.up.railway.app/auth/discord.callback`
4. Copy Client ID and Secret

## Troubleshooting

### Build/Deployment Issues

#### "VOLUME keyword is banned" Error
- This project uses `Dockerfile.railway` which removes the VOLUME directive
- Ensure Railway is using the correct Dockerfile via `railway.json`
- If error persists, check that Railway is reading from the correct branch

#### "PORT variable must be integer" Error
- Do NOT set PORT in your environment variables
- Railway automatically provides PORT at runtime
- The application will use Railway's PORT or default to 3000

#### Health Check Failing
- The health check endpoint is `/_health` (not `/api/health`)
- Health check requires both PostgreSQL and Redis to be running
- Ensure DATABASE_URL and REDIS_URL are properly configured
- Check application logs for specific startup errors
- Common issues:
  - Missing required environment variables (SECRET_KEY, UTILS_SECRET)
  - Database not yet provisioned
  - Redis not yet running
  - No authentication provider configured

### Database Connection Issues
- Ensure `PGSSLMODE=require` is set
- Check that `DATABASE_URL` is using Railway's reference variable

### Redis Connection Issues
- Verify `REDIS_URL` is using Railway's reference variable
- Redis should be in the same project for internal networking

### Authentication Issues
- Verify OAuth redirect URIs match your Railway URL exactly
- Ensure client IDs and secrets are correct
- Check that at least one auth provider is configured

### Email Issues
- Verify Resend API key is correct
- Ensure FROM email is verified in Resend
- Check SMTP settings match Resend documentation

### File Upload Issues

#### Railway Volume Issues
- Ensure volume is mounted at `/var/lib/outline/data`
- Check volume size limits (50GB max on Pro plan)
- Verify `FILE_STORAGE=local` is set

#### MinIO Issues
- Ensure MinIO service is running
- Verify bucket 'outline-uploads' exists in MinIO
- Check that `AWS_S3_FORCE_PATH_STYLE=true` is set
- Verify internal networking between services using `minio.railway.internal`

## Maintenance

### Database Backups
- Use Railway's database backup feature
- Schedule regular backups through Railway dashboard

### Monitoring
- Monitor application logs in Railway
- Set up Sentry for error tracking
- Use Railway's metrics dashboard

### Updates
- Updates deploy automatically when pushing to connected branch
- Database migrations run automatically on deployment
- No manual intervention required for most updates

## Support

For Outline-specific issues: https://github.com/outline/outline
For Railway platform issues: https://railway.app/help
For Resend email issues: https://resend.com/docs

## Important Notes

- **Dockerfile**: We use `Dockerfile.railway` which removes the VOLUME directive that Railway doesn't support
- **File Storage**: Choose between Railway Volumes (simpler, up to 50GB) or MinIO (scalable, S3-compatible)
- **Railway Volumes**: Persistent storage mounted at `/var/lib/outline/data`, perfect for smaller deployments
- **MinIO**: Better for larger deployments or if you need S3-compatible API
- **Volume Limits**: Free plan: 0.5GB, Hobby: 5GB, Pro/Team: 50GB
# Setup Mode Changes for Railway Deployment

## Overview
These changes allow you to force the installation wizard to appear on your Railway deployment by setting an environment variable.

## Files Modified

### 1. `server/utils/setupMode.ts` (NEW)
```typescript
export function isInSetupMode(): boolean {
  return process.env.FORCE_SETUP_MODE === "true";
}
```

### 2. `server/routes/api/auth/auth.ts`
- Added import: `import { isInSetupMode } from "@server/utils/setupMode";`
- Modified `auth.config` endpoint to return empty providers when in setup mode
- This forces the login page to show the installation wizard

### 3. `server/routes/api/index.ts`
- Added import: `import { isInSetupMode } from "@server/utils/setupMode";`
- Modified condition: `if (!env.isCloudHosted || isInSetupMode())`
- This enables the installation routes when in setup mode

### 4. `server/routes/api/installation/installation.ts`
- Added import: `import { isInSetupMode } from "@server/utils/setupMode";`
- Modified team existence check to allow creating new teams in setup mode

### 5. `Dockerfile.railway`
- Added scripts directory to the build
- Changed CMD to use `railway-start.sh`

### 6. `scripts/railway-start.sh` (NEW)
- Runs database migrations
- Checks for FORCE_SETUP_MODE
- Starts the application

### 7. `check-env.js`
- Updated to show setup mode status
- Provides instructions for enabling setup mode

## How to Use

1. In your Railway project, add this environment variable:
   ```
   FORCE_SETUP_MODE=true
   ```

2. Redeploy your service

3. Visit your Railway URL - you should now see the installation wizard

4. Complete the setup by entering:
   - Workspace name
   - Admin user name
   - Admin user email

5. **Important**: After setup is complete, remove the `FORCE_SETUP_MODE` environment variable and redeploy

## What Happens

When `FORCE_SETUP_MODE=true`:
- The `/api/auth.config` endpoint returns empty providers
- This triggers the login page to show the WorkspaceSetup component
- The `/api/installation.create` endpoint allows creating teams even if they exist
- You can create a new admin user through the UI

## Notes

- This is designed for Railway deployments where you can't easily reset the database
- The setup mode only affects the initial setup flow
- Once you remove the environment variable, normal authentication will resume
- If you already have OAuth configured, those providers will work again after removing setup mode
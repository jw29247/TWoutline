# Troubleshooting Setup Mode

## If FORCE_SETUP_MODE=true isn't working

### 1. Check Railway Logs

After deploying with `FORCE_SETUP_MODE=true`, check your Railway logs for these messages:
```
Auth config endpoint called
FORCE_SETUP_MODE: true
isInSetupMode(): true
Setup mode is active - returning empty providers and no name
```

### 2. Verify Environment Variable

In Railway:
- Go to your service settings
- Check Variables tab
- Ensure `FORCE_SETUP_MODE` is set to exactly `true` (no quotes)
- Make sure you've redeployed after setting it

### 3. Clear Browser State

The auth config might be cached:
1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Clear for your Outline domain:
   - Cookies
   - Local Storage
   - Session Storage
4. Try in an incognito/private window

### 4. Check the API Response

Open browser developer tools and check the Network tab:
1. Load your Outline URL
2. Look for the `/api/auth.config` request
3. Check the response - it should show:
```json
{
  "data": {
    "providers": []
  }
}
```

### 5. Manual API Test

You can test the API directly:
```bash
curl -X POST https://your-outline-url.railway.app/api/auth.config \
  -H "Content-Type: application/json" \
  -d '{}'
```

Should return:
```json
{"data":{"providers":[]}}
```

### 6. Frontend Console

Open browser console and check for errors. The frontend should detect:
- `config.providers.length === 0`
- `!config.name`
- This should trigger `firstRun = true`

### 7. Alternative Approach

If setup mode still doesn't work, you can:

1. Use the database reset script locally:
   ```bash
   node scripts/reset-to-installation-minimal.js
   ```

2. Or manually create an admin user using SQL in Railway's database console

### 8. Check Deployment

Ensure the modified files are deployed:
- `server/routes/api/auth/auth.ts`
- `server/routes/api/index.ts`  
- `server/routes/api/installation/installation.ts`
- `server/utils/setupMode.ts`

### Common Issues

1. **Environment variable not set correctly**
   - Must be exactly `FORCE_SETUP_MODE=true`
   - No quotes around `true`
   - Case sensitive

2. **Cache issues**
   - Browser cache holding old auth config
   - Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

3. **Build not updated**
   - Ensure Railway rebuilt with the new code
   - Check deployment logs

4. **CloudFlare or proxy caching**
   - If using CloudFlare, purge cache
   - Try accessing directly via Railway URL
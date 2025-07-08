#!/usr/bin/env node

// Environment check script for Railway deployment
console.log("=== Outline Environment Check ===\n");

const required = [
  'DATABASE_URL',
  'REDIS_URL',
  'SECRET_KEY',
  'UTILS_SECRET',
  'URL'
];

const authProviders = [
  'GOOGLE_CLIENT_ID',
  'SLACK_CLIENT_ID',
  'AZURE_CLIENT_ID',
  'DISCORD_CLIENT_ID'
];

let hasErrors = false;

// Check required variables
console.log("Required Environment Variables:");
required.forEach(key => {
  if (process.env[key]) {
    console.log(`✓ ${key}: Set`);
  } else {
    console.log(`✗ ${key}: Missing`);
    hasErrors = true;
  }
});

// Check auth providers
console.log("\nAuthentication Providers (at least one required):");
const hasAuth = authProviders.some(key => process.env[key]);
authProviders.forEach(key => {
  if (process.env[key]) {
    console.log(`✓ ${key}: Set`);
  } else {
    console.log(`  ${key}: Not configured`);
  }
});

if (!hasAuth) {
  console.log("\n✗ ERROR: No authentication provider configured!");
  hasErrors = true;
}

// Check optional but recommended
console.log("\nOptional Configuration:");
console.log(`  PORT: ${process.env.PORT || 'Not set (will use 3000)'}`);
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
console.log(`  FILE_STORAGE: ${process.env.FILE_STORAGE || 'Not set (will use local)'}`);

// Check setup mode
console.log("\nSetup Mode Configuration:");
console.log(`  FORCE_SETUP_MODE: ${process.env.FORCE_SETUP_MODE || 'Not set'}`);
if (process.env.FORCE_SETUP_MODE === 'true') {
  console.log("  ✅ Setup mode is ENABLED - Installation wizard will be shown");
  console.log("  📝 After completing setup, remove FORCE_SETUP_MODE from Railway");
} else {
  console.log("  ℹ️  Setup mode is DISABLED - Normal login will be shown");
}

// Railway detection
if (process.env.RAILWAY_ENVIRONMENT) {
  console.log("\n🚂 Railway Environment Detected:");
  console.log(`  Environment: ${process.env.RAILWAY_ENVIRONMENT}`);
  console.log(`  Project ID: ${process.env.RAILWAY_PROJECT_ID || 'Not set'}`);
}

if (hasErrors) {
  console.log("\n❌ Environment check failed! Please configure missing variables.");
  process.exit(1);
} else {
  console.log("\n✅ Environment check passed!");
  if (!hasAuth && process.env.FORCE_SETUP_MODE !== 'true') {
    console.log("\n⚠️  TIP: No auth provider configured. Set FORCE_SETUP_MODE=true to use setup wizard.");
  }
}
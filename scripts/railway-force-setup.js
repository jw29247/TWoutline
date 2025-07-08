#!/usr/bin/env node
// Force Railway instance to show setup wizard by temporarily modifying env
// This script should be run ONCE during initial deployment

const fs = require('fs');
const path = require('path');

console.log("🚀 Railway Setup Mode Enabler\n");

// Check if we should force setup mode
const FORCE_SETUP = process.env.FORCE_SETUP_WIZARD === 'true';
const SETUP_COMPLETED_FILE = path.join(process.cwd(), '.setup-completed');

if (!FORCE_SETUP) {
  console.log("ℹ️  FORCE_SETUP_WIZARD is not set to 'true'");
  console.log("   Set FORCE_SETUP_WIZARD=true in Railway to enable setup mode");
  process.exit(0);
}

// Check if setup was already completed
if (fs.existsSync(SETUP_COMPLETED_FILE)) {
  console.log("✅ Setup already completed (found .setup-completed file)");
  console.log("   Remove this file to run setup again");
  process.exit(0);
}

console.log("⚠️  FORCING SETUP MODE");
console.log("   The installation wizard will be shown");
console.log("   This will temporarily mark the instance as self-hosted\n");

// Create a marker file to indicate setup mode is active
fs.writeFileSync('.setup-mode-active', 'true');

console.log("📝 Setup mode activated!");
console.log("   Visit your Railway URL to complete setup");
console.log("   After setup, the system will automatically disable setup mode\n");

process.exit(0);
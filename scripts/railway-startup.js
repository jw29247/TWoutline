#!/usr/bin/env node
// Railway startup script - handles initialization and normal startup

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("🚀 Railway Outline Startup Script\n");

// Check if we should enable setup mode
const FORCE_SETUP = process.env.FORCE_SETUP_WIZARD === 'true';
const SETUP_COMPLETED_FILE = path.join(process.cwd(), '.setup-completed');

async function checkDatabaseStatus() {
  try {
    const { sequelize } = require("../build/server/storage/database");
    
    // Check if database is accessible
    await sequelize.authenticate();
    console.log("✅ Database connection established");
    
    // Check if any teams exist
    const teamCount = await sequelize.models.Team.count();
    const userCount = await sequelize.models.User.count();
    
    await sequelize.close();
    
    return { teamCount, userCount };
  } catch (error) {
    console.log("⚠️  Database not ready or error:", error.message);
    return { teamCount: -1, userCount: -1 };
  }
}

async function main() {
  // Run database migrations first
  console.log("📦 Running database migrations...");
  await runCommand('yarn', ['db:migrate']);
  
  // Check database status
  const { teamCount, userCount } = await checkDatabaseStatus();
  
  // Determine if we need setup mode
  let needsSetup = false;
  
  if (FORCE_SETUP && !fs.existsSync(SETUP_COMPLETED_FILE)) {
    console.log("\n⚠️  FORCE_SETUP_WIZARD is enabled");
    needsSetup = true;
  } else if (teamCount === 0 && userCount === 0) {
    console.log("\n✨ Fresh installation detected");
    needsSetup = true;
  }
  
  if (needsSetup) {
    console.log("🎯 Setup wizard will be shown");
    console.log("📝 Visit your Railway URL to complete setup\n");
    
    // Create a temporary file to signal setup mode
    fs.writeFileSync('.setup-mode-active', 'true');
    
    // Start the server with modified environment
    process.env.FORCE_SELF_HOSTED = 'true';
  } else {
    console.log(`\n✅ Instance already configured`);
    console.log(`   Teams: ${teamCount}, Users: ${userCount}\n`);
    
    // Remove setup mode file if it exists
    if (fs.existsSync('.setup-mode-active')) {
      fs.unlinkSync('.setup-mode-active');
    }
  }
  
  // Start the main application
  console.log("🚀 Starting Outline server...\n");
  const server = spawn('yarn', ['start'], {
    stdio: 'inherit',
    env: process.env
  });
  
  server.on('exit', (code) => {
    process.exit(code);
  });
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'inherit' });
    proc.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

// Run the startup process
main().catch(error => {
  console.error("❌ Startup error:", error);
  process.exit(1);
});
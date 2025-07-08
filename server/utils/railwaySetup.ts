import fs from "fs";
import path from "path";

/**
 * Railway setup mode utilities
 */

// Check if setup mode is active
export function isSetupModeActive(): boolean {
  // Check for setup mode file
  const setupModeFile = path.join(process.cwd(), ".setup-mode-active");
  if (fs.existsSync(setupModeFile)) {
    return true;
  }
  
  // Check environment variable
  return process.env.FORCE_SELF_HOSTED === "true";
}

// Mark setup as completed
export function markSetupCompleted(): void {
  const setupCompletedFile = path.join(process.cwd(), ".setup-completed");
  fs.writeFileSync(setupCompletedFile, new Date().toISOString());
  
  // Remove setup mode file
  const setupModeFile = path.join(process.cwd(), ".setup-mode-active");
  if (fs.existsSync(setupModeFile)) {
    fs.unlinkSync(setupModeFile);
  }
  
  console.log("✅ Setup completed, disabling setup mode");
}

// Check if this is a Railway deployment
export function isRailwayDeployment(): boolean {
  return process.env.RAILWAY_ENVIRONMENT !== undefined;
}
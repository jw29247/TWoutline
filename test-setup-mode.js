#!/usr/bin/env node

console.log("Testing Setup Mode Configuration\n");

console.log("Environment Variables:");
console.log("FORCE_SETUP_MODE:", process.env.FORCE_SETUP_MODE);
console.log("Type:", typeof process.env.FORCE_SETUP_MODE);
console.log("Is 'true'?:", process.env.FORCE_SETUP_MODE === "true");
console.log("Raw value:", JSON.stringify(process.env.FORCE_SETUP_MODE));

// Test the function directly
function isInSetupMode() {
  return process.env.FORCE_SETUP_MODE === "true";
}

console.log("\nFunction test:");
console.log("isInSetupMode():", isInSetupMode());

// Common issues
console.log("\nPossible issues to check:");
console.log("1. Make sure FORCE_SETUP_MODE=true (no quotes in Railway)");
console.log("2. Make sure to redeploy after setting the variable");
console.log("3. Check Railway logs for the console.log output");
console.log("4. Clear browser cache/cookies and try incognito mode");
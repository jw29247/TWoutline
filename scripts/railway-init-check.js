#!/usr/bin/env node
// Railway initialization check - runs on startup to check if setup is needed
// This script checks if the instance needs initialization and logs the status

const { sequelize } = require("../build/server/storage/database");

async function checkInitializationStatus() {
  try {
    console.log("🔍 Checking Outline initialization status...");
    
    // Check if any teams exist
    const teamCount = await sequelize.models.Team.count();
    console.log(`📊 Teams found: ${teamCount}`);
    
    // Check if any users exist
    const userCount = await sequelize.models.User.count();
    console.log(`👥 Users found: ${userCount}`);
    
    // Check authentication providers
    const authProviderCount = await sequelize.models.AuthenticationProvider.count();
    console.log(`🔐 Auth providers found: ${authProviderCount}`);
    
    if (teamCount === 0 && userCount === 0) {
      console.log("\n✅ Installation wizard will be shown!");
      console.log("📝 Visit your Railway URL to complete setup.");
    } else {
      console.log("\n⚠️  Instance already initialized");
      console.log(`Found ${teamCount} teams and ${userCount} users`);
    }
    
  } catch (error) {
    console.error("❌ Error checking initialization:", error.message);
    // Don't exit with error - let the app start anyway
  } finally {
    await sequelize.close();
  }
}

// Run the check
checkInitializationStatus();
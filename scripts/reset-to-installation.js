#!/usr/bin/env node
// Script to reset Outline to show the installation wizard
// WARNING: This will DELETE ALL DATA in your Outline instance!

const { sequelize } = require("../build/server/storage/database");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function resetToInstallation() {
  console.log("\n⚠️  WARNING: This script will DELETE ALL DATA in your Outline instance!");
  console.log("This includes:");
  console.log("- All teams and users");
  console.log("- All documents and collections");
  console.log("- All authentication providers");
  console.log("- All other data\n");

  rl.question("Are you sure you want to continue? Type 'yes' to confirm: ", async (answer) => {
    if (answer.toLowerCase() !== 'yes') {
      console.log("\n❌ Reset cancelled.");
      rl.close();
      process.exit(0);
    }

    try {
      console.log("\n🔄 Starting reset process...\n");

      // Get all table names except migrations table
      const [tables] = await sequelize.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename != 'migrations'
        ORDER BY tablename
      `);

      // Disable foreign key checks temporarily
      await sequelize.query('SET session_replication_role = replica;');

      // Truncate all tables
      for (const { tablename } of tables) {
        console.log(`🗑️  Clearing table: ${tablename}`);
        await sequelize.query(`TRUNCATE TABLE "${tablename}" CASCADE`);
      }

      // Re-enable foreign key checks
      await sequelize.query('SET session_replication_role = DEFAULT;');

      console.log("\n✅ All data has been cleared!");
      console.log("\n📝 Next steps:");
      console.log("1. Clear your Redis cache (if using Redis):");
      console.log("   redis-cli FLUSHALL");
      console.log("2. Clear browser data:");
      console.log("   - Local storage");
      console.log("   - Session storage");
      console.log("   - Cookies for your Outline domain");
      console.log("3. Restart your Outline server");
      console.log("4. Visit your Outline URL - you should see the installation wizard");
      console.log("\n🎉 The installation wizard will appear when you visit Outline!");

    } catch (error) {
      console.error("\n❌ Error during reset:", error.message);
      console.error("\nFull error:", error);
      process.exit(1);
    } finally {
      rl.close();
      await sequelize.close();
    }
  });
}

// Run the script
console.log("🚀 Outline Reset to Installation Script\n");
resetToInstallation();
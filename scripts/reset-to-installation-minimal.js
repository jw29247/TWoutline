#!/usr/bin/env node
// Minimal script to reset Outline to show the installation wizard
// This only clears the minimum required data

const { sequelize } = require("../build/server/storage/database");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function minimalReset() {
  console.log("\n⚠️  WARNING: This script will reset your Outline instance!");
  console.log("This will delete:");
  console.log("- All teams");
  console.log("- All users and authentication data");
  console.log("- Authentication providers\n");
  console.log("Documents and collections will also be removed as they depend on teams.\n");

  rl.question("Are you sure you want to continue? Type 'yes' to confirm: ", async (answer) => {
    if (answer.toLowerCase() !== 'yes') {
      console.log("\n❌ Reset cancelled.");
      rl.close();
      process.exit(0);
    }

    try {
      console.log("\n🔄 Starting minimal reset...\n");

      // Start a transaction
      const transaction = await sequelize.transaction();

      try {
        // Tables to clear in order (respecting foreign key constraints)
        const tablesToClear = [
          'sessions',
          'api_keys',
          'user_authentications',
          'authentication_providers',
          'group_users',
          'groups',
          'user_memberships',
          'document_collaborators',
          'shares',
          'stars',
          'subscriptions',
          'notifications',
          'events',
          'revisions',
          'documents',
          'collections',
          'users',
          'teams'
        ];

        for (const table of tablesToClear) {
          try {
            console.log(`🗑️  Clearing table: ${table}`);
            await sequelize.query(`TRUNCATE TABLE "${table}" CASCADE`, { transaction });
          } catch (err) {
            console.log(`   ⚠️  Table ${table} might not exist, skipping...`);
          }
        }

        await transaction.commit();
        console.log("\n✅ Reset complete!");

      } catch (error) {
        await transaction.rollback();
        throw error;
      }

      console.log("\n📝 Next steps:");
      console.log("1. Clear your Redis cache (if using Redis):");
      console.log("   redis-cli FLUSHALL");
      console.log("2. Clear browser data for your Outline domain:");
      console.log("   - Cookies");
      console.log("   - Local storage");
      console.log("   - Session storage");
      console.log("3. Restart your Outline server");
      console.log("4. Visit your Outline URL");
      console.log("\n🎉 The installation wizard will appear!");

    } catch (error) {
      console.error("\n❌ Error during reset:", error.message);
      process.exit(1);
    } finally {
      rl.close();
      await sequelize.close();
    }
  });
}

// Run the script
console.log("🚀 Outline Minimal Reset Script\n");
minimalReset();
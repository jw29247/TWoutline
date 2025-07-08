#!/usr/bin/env node
// Script to create the first admin user when team exists but user creation failed

const { sequelize } = require("../build/server/storage/database");
const { User, Team, AuthenticationProvider } = require("../build/server/models");

async function createFirstAdmin() {
  try {
    // Find the team
    const teams = await Team.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    if (teams.length === 0) {
      console.error("No teams found in database");
      process.exit(1);
    }

    console.log("\nFound teams:");
    teams.forEach((team, index) => {
      console.log(`${index + 1}. ${team.name} (${team.subdomain || 'no subdomain'}) - ID: ${team.id}`);
    });

    // Use the first team by default
    const team = teams[0];
    console.log(`\nUsing team: ${team.name}`);

    // Check if any users exist for this team
    const existingUsers = await User.count({ where: { teamId: team.id } });
    if (existingUsers > 0) {
      console.log(`\nTeam already has ${existingUsers} users.`);
      
      const users = await User.findAll({ 
        where: { teamId: team.id },
        limit: 5 
      });
      
      console.log("\nExisting users:");
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
      });
      
      return;
    }

    // Create the admin user
    const email = process.env.ADMIN_EMAIL || 'admin@thatworks.agency';
    const name = process.env.ADMIN_NAME || 'Admin User';

    console.log(`\nCreating admin user: ${name} (${email})`);

    const user = await User.create({
      email: email.toLowerCase(),
      name: name,
      role: 'admin',
      teamId: team.id,
      lastActiveAt: new Date(),
      isViewer: false,
    });

    console.log(`✅ Admin user created successfully!`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Team: ${team.name}`);

    // Check for Google auth provider
    const googleAuth = await AuthenticationProvider.findOne({
      where: { 
        teamId: team.id,
        name: 'google'
      }
    });

    if (googleAuth) {
      console.log(`\n✅ Google authentication is configured for this team`);
      console.log(`   You can now sign in at: https://outline.workshub.agency/auth/google`);
    } else {
      console.log(`\n⚠️  Google authentication provider not found for this team`);
      console.log(`   You may need to configure it in the database`);
    }

  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the script
console.log("🚀 Creating first admin user...\n");
createFirstAdmin();
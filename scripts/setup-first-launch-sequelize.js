#!/usr/bin/env node
// First launch setup using Outline's existing database connection
require('dotenv').config();

// Override DATABASE_URL for this script
process.env.DATABASE_URL = 'postgresql://postgres:lMMWSVAkVeiFvtDygibCnaazavyDpOns@gondola.proxy.rlwy.net:29588/railway';

const { sequelize } = require('../build/server/storage/database');
const { Team, User, TeamDomain, AuthenticationProvider } = require('../build/server/models');

async function setupFirstLaunch() {
  try {
    console.log('✅ Connecting to database...\n');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Check current state
    const teamCount = await Team.count();
    const userCount = await User.count();
    
    console.log(`Current state:`);
    console.log(`- Teams: ${teamCount}`);
    console.log(`- Users: ${userCount}\n`);

    // Get or create team
    let team = await Team.findOne();
    
    if (!team) {
      console.log('Creating team: ThatWorks Agency');
      team = await Team.create({
        name: 'ThatWorks Agency',
        subdomain: 'thatworks',
        defaultUserRole: 'member',
        inviteRequired: false,
        sharing: true,
        guestSignin: true,
        documentEmbeds: true,
        memberCollectionCreate: true,
        memberTeamCreate: true,
      });
      console.log(`✅ Team created: ${team.id}\n`);
    } else {
      console.log(`Using existing team: ${team.name} (${team.id})`);
      
      // Ensure invites are not required
      if (team.inviteRequired) {
        await team.update({ inviteRequired: false });
        console.log('✅ Updated team to not require invites\n');
      }
    }

    // Add allowed domain
    const domainExists = await TeamDomain.findOne({
      where: {
        teamId: team.id,
        name: 'thatworks.agency'
      }
    });

    if (!domainExists) {
      await TeamDomain.create({
        name: 'thatworks.agency',
        teamId: team.id,
      });
      console.log('✅ Added allowed domain: thatworks.agency\n');
    } else {
      console.log('Allowed domain already exists: thatworks.agency\n');
    }

    // Create or update admin user
    let user = await User.findOne({
      where: {
        email: 'jacob@thatworks.agency',
        teamId: team.id
      }
    });

    if (!user) {
      user = await User.create({
        email: 'jacob@thatworks.agency',
        name: 'Jacob',
        role: 'admin',
        teamId: team.id,
        isAdmin: true,
        isViewer: false,
      });
      console.log('✅ Created admin user: jacob@thatworks.agency\n');
    } else {
      await user.update({
        role: 'admin',
        isAdmin: true,
        isViewer: false,
        suspendedAt: null,
      });
      console.log('✅ Updated user to admin: jacob@thatworks.agency\n');
    }

    // Ensure Google auth provider exists
    let authProvider = await AuthenticationProvider.findOne({
      where: {
        teamId: team.id,
        name: 'google'
      }
    });

    if (!authProvider) {
      authProvider = await AuthenticationProvider.create({
        name: 'google',
        teamId: team.id,
        enabled: true,
      });
      console.log('✅ Created Google authentication provider\n');
    } else if (!authProvider.enabled) {
      await authProvider.update({ enabled: true });
      console.log('✅ Enabled Google authentication provider\n');
    }

    // Final summary
    console.log('=== Setup Complete ===\n');
    console.log(`Team: ${team.name}`);
    console.log(`Subdomain: ${team.subdomain || 'none'}`);
    console.log(`Admin user: jacob@thatworks.agency`);
    console.log(`Allowed domain: thatworks.agency`);
    console.log(`Invite required: ${team.inviteRequired ? 'Yes' : 'No'}`);
    console.log('\n🎉 You can now sign in at: https://outline.workshub.agency/auth/google');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// Run the setup
console.log('🚀 Setting up Outline for first launch...\n');
setupFirstLaunch();
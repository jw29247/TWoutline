#!/usr/bin/env node
const { Client } = require('pg');

// Database connection
const DATABASE_URL = 'postgresql://postgres:lMMWSVAkVeiFvtDygibCnaazavyDpOns@gondola.proxy.rlwy.net:29588/railway';

async function setupFirstLaunch() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check current state
    const teamCheck = await client.query('SELECT COUNT(*) as count FROM teams');
    const userCheck = await client.query('SELECT COUNT(*) as count FROM users');
    
    console.log(`Current state:`);
    console.log(`- Teams: ${teamCheck.rows[0].count}`);
    console.log(`- Users: ${userCheck.rows[0].count}\n`);

    // Get or create team
    let team;
    const existingTeam = await client.query('SELECT * FROM teams LIMIT 1');
    
    if (existingTeam.rows.length === 0) {
      console.log('Creating team: ThatWorks Agency');
      const teamResult = await client.query(`
        INSERT INTO teams (
          id, name, subdomain, "defaultUserRole", "inviteRequired",
          sharing, "guestSignin", "documentEmbeds", "memberCollectionCreate",
          "memberTeamCreate", "approximateTotalAttachmentsSize", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), 'ThatWorks Agency', 'thatworks', 'member', false,
          true, true, true, true, true, 0, NOW(), NOW()
        ) RETURNING *
      `);
      team = teamResult.rows[0];
      console.log(`✅ Team created: ${team.id}\n`);
    } else {
      team = existingTeam.rows[0];
      console.log(`Using existing team: ${team.name} (${team.id})`);
      
      // Ensure invites are not required
      if (team.inviteRequired) {
        await client.query(
          'UPDATE teams SET "inviteRequired" = false, "updatedAt" = NOW() WHERE id = $1',
          [team.id]
        );
        console.log('✅ Updated team to not require invites\n');
      }
    }

    // Add allowed domain
    const domainCheck = await client.query(
      'SELECT * FROM team_domains WHERE "teamId" = $1 AND name = $2',
      [team.id, 'thatworks.agency']
    );

    if (domainCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO team_domains (id, name, "teamId", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
      `, ['thatworks.agency', team.id]);
      console.log('✅ Added allowed domain: thatworks.agency\n');
    } else {
      console.log('Allowed domain already exists: thatworks.agency\n');
    }

    // Create or update admin user
    const userCheck2 = await client.query(
      'SELECT * FROM users WHERE email = $1 AND "teamId" = $2',
      ['jacob@thatworks.agency', team.id]
    );

    if (userCheck2.rows.length === 0) {
      await client.query(`
        INSERT INTO users (
          id, email, name, role, "teamId", "isAdmin", "isViewer",
          "lastActiveAt", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), $1, $2, 'admin', $3, true, false,
          NOW(), NOW(), NOW()
        )
      `, ['jacob@thatworks.agency', 'Jacob', team.id]);
      console.log('✅ Created admin user: jacob@thatworks.agency\n');
    } else {
      await client.query(`
        UPDATE users 
        SET role = 'admin', "isAdmin" = true, "isViewer" = false,
            "suspendedAt" = NULL, "updatedAt" = NOW()
        WHERE email = $1 AND "teamId" = $2
      `, ['jacob@thatworks.agency', team.id]);
      console.log('✅ Updated user to admin: jacob@thatworks.agency\n');
    }

    // Ensure Google auth provider exists
    const authCheck = await client.query(
      'SELECT * FROM authentication_providers WHERE "teamId" = $1 AND name = $2',
      [team.id, 'google']
    );

    if (authCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO authentication_providers (
          id, name, "teamId", enabled, "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), 'google', $1, true, NOW(), NOW()
        )
      `, [team.id]);
      console.log('✅ Created Google authentication provider\n');
    } else if (!authCheck.rows[0].enabled) {
      await client.query(
        'UPDATE authentication_providers SET enabled = true, "updatedAt" = NOW() WHERE id = $1',
        [authCheck.rows[0].id]
      );
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
    if (error.detail) console.error('Details:', error.detail);
  } finally {
    await client.end();
  }
}

// Run the setup
setupFirstLaunch();
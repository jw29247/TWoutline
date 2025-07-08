const crypto = require('crypto');

// Generate UUIDs
const teamId = crypto.randomUUID();
const userId = crypto.randomUUID();
const domainId = crypto.randomUUID();
const authProviderId = crypto.randomUUID();

const sql = `
-- First Launch Setup SQL for Outline
-- Generated at: ${new Date().toISOString()}

-- Create the team
INSERT INTO teams (
    id,
    name,
    subdomain,
    "defaultUserRole",
    "inviteRequired",
    sharing,
    "guestSignin",
    "documentEmbeds",
    "memberCollectionCreate",
    "memberTeamCreate",
    "approximateTotalAttachmentsSize",
    "createdAt",
    "updatedAt"
) VALUES (
    '${teamId}',
    'ThatWorks Agency',
    'thatworks',
    'member',
    false,
    true,
    true,
    true,
    true,
    true,
    0,
    NOW(),
    NOW()
) ON CONFLICT (subdomain) DO UPDATE SET
    "inviteRequired" = false,
    "updatedAt" = NOW();

-- Add allowed domain
INSERT INTO team_domains (
    id,
    name,
    "teamId",
    "createdAt",
    "updatedAt"
) VALUES (
    '${domainId}',
    'thatworks.agency',
    '${teamId}',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Create admin user
INSERT INTO users (
    id,
    email,
    name,
    role,
    "teamId",
    "isAdmin",
    "isViewer",
    "lastActiveAt",
    "createdAt",
    "updatedAt"
) VALUES (
    '${userId}',
    'jacob@thatworks.agency',
    'Jacob',
    'admin',
    '${teamId}',
    true,
    false,
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (email, "teamId") DO UPDATE SET
    role = 'admin',
    "isAdmin" = true,
    "isViewer" = false,
    "suspendedAt" = NULL,
    "updatedAt" = NOW();

-- Create Google auth provider
INSERT INTO authentication_providers (
    id,
    name,
    "teamId",
    enabled,
    "createdAt",
    "updatedAt"
) VALUES (
    '${authProviderId}',
    'google',
    '${teamId}',
    true,
    NOW(),
    NOW()
) ON CONFLICT (name, "teamId") DO UPDATE SET
    enabled = true,
    "updatedAt" = NOW();

-- Show results
SELECT 'Team created: ' || name || ' (ID: ' || id || ')' as status FROM teams WHERE id = '${teamId}';
SELECT 'Admin user created: ' || email || ' (ID: ' || id || ')' as status FROM users WHERE id = '${userId}';
SELECT 'Allowed domain: ' || name as status FROM team_domains WHERE id = '${domainId}';
SELECT 'Auth provider: ' || name || ' enabled' as status FROM authentication_providers WHERE id = '${authProviderId}';
`;

console.log(sql);

// Also save to file
const fs = require('fs');
fs.writeFileSync('scripts/setup-generated.sql', sql);
console.log('\n\nSQL saved to: scripts/setup-generated.sql');
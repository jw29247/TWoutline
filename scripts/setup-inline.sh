#!/bin/bash

# Since we can't use psql directly, let's output the SQL commands 
# that need to be run in the Railway dashboard or any PostgreSQL client

cat << 'EOF'
===========================================
OUTLINE FIRST LAUNCH SETUP
===========================================

Please run these SQL commands in your PostgreSQL database:

1. Connect to: postgresql://postgres:lMMWSVAkVeiFvtDygibCnaazavyDpOns@gondola.proxy.rlwy.net:29588/railway

2. Execute the following SQL:

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
    '082f3b83-65ad-4c6e-9dc6-ad27bbe8a779',
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
    'f0b5ae97-ce82-4a74-842e-b263b71c6b28',
    'thatworks.agency',
    '082f3b83-65ad-4c6e-9dc6-ad27bbe8a779',
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
    '1c7651c7-1068-4e56-aeda-aeca65a9fcfb',
    'jacob@thatworks.agency',
    'Jacob',
    'admin',
    '082f3b83-65ad-4c6e-9dc6-ad27bbe8a779',
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
    'f4dddd48-0390-45a6-b607-2677c6bb6a85',
    'google',
    '082f3b83-65ad-4c6e-9dc6-ad27bbe8a779',
    true,
    NOW(),
    NOW()
) ON CONFLICT (name, "teamId") DO UPDATE SET
    enabled = true,
    "updatedAt" = NOW();

===========================================

After running these commands:
✅ Team: ThatWorks Agency (subdomain: thatworks)
✅ Admin: jacob@thatworks.agency
✅ Allowed domain: thatworks.agency
✅ Google auth enabled

You can sign in at: https://outline.workshub.agency/auth/google

EOF
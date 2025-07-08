-- First check if team already exists
SELECT id, name, subdomain FROM teams WHERE subdomain = 'thatworks' OR name LIKE '%ThatWorks%';

-- Create admin user first (needed for createdById)
INSERT INTO users (
    id,
    email,
    name,
    role,
    "teamId",
    "lastActiveAt",
    "createdAt",
    "updatedAt"
) VALUES (
    '1c7651c7-1068-4e56-aeda-aeca65a9fcfb',
    'jacob@thatworks.agency',
    'Jacob',
    'admin',
    '082f3b83-65ad-4c6e-9dc6-ad27bbe8a779',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (email, "teamId") DO UPDATE SET
    role = 'admin',
    "suspendedAt" = NULL,
    "updatedAt" = NOW();

-- Add allowed domain with the admin user as creator
INSERT INTO team_domains (
    id,
    name,
    "teamId",
    "createdById",
    "createdAt",
    "updatedAt"
) VALUES (
    'f0b5ae97-ce82-4a74-842e-b263b71c6b28',
    'thatworks.agency',
    '082f3b83-65ad-4c6e-9dc6-ad27bbe8a779',
    '1c7651c7-1068-4e56-aeda-aeca65a9fcfb',
    NOW(),
    NOW()
) ON CONFLICT (name, "teamId") DO NOTHING;

-- Create Google auth provider (check table structure first)
\d authentication_providers

-- Show final status
SELECT 'Team: ' || t.name || ' (subdomain: ' || COALESCE(t.subdomain, 'none') || ')' as info
FROM teams t WHERE t.id = '082f3b83-65ad-4c6e-9dc6-ad27bbe8a779';

SELECT 'Admin user: ' || u.email || ' (role: ' || u.role || ')' as info
FROM users u WHERE u.id = '1c7651c7-1068-4e56-aeda-aeca65a9fcfb';

SELECT 'Allowed domain: ' || td.name as info
FROM team_domains td WHERE td."teamId" = '082f3b83-65ad-4c6e-9dc6-ad27bbe8a779';
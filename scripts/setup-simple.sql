-- Get team info
SELECT id, name, subdomain, "inviteRequired" FROM teams WHERE subdomain = 'thatworks';

-- Update team to not require invites
UPDATE teams SET "inviteRequired" = false WHERE subdomain = 'thatworks';

-- Check if user exists
SELECT id, email, role FROM users WHERE email = 'jacob@thatworks.agency';

-- Create admin user (use the team ID from the first query)
INSERT INTO users (
    id,
    email,
    name,
    role,
    "teamId",
    "lastActiveAt",
    "createdAt",
    "updatedAt"
) 
SELECT 
    gen_random_uuid(),
    'jacob@thatworks.agency',
    'Jacob',
    'admin',
    id,
    NOW(),
    NOW(),
    NOW()
FROM teams 
WHERE subdomain = 'thatworks'
AND NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'jacob@thatworks.agency'
);

-- Update existing user to admin
UPDATE users 
SET role = 'admin', 
    "suspendedAt" = NULL,
    "updatedAt" = NOW()
WHERE email = 'jacob@thatworks.agency';

-- Add allowed domain
INSERT INTO team_domains (
    id,
    name,
    "teamId", 
    "createdById",
    "createdAt",
    "updatedAt"
)
SELECT 
    gen_random_uuid(),
    'thatworks.agency',
    t.id,
    u.id,
    NOW(),
    NOW()
FROM teams t
CROSS JOIN users u
WHERE t.subdomain = 'thatworks' 
  AND u.email = 'jacob@thatworks.agency'
  AND NOT EXISTS (
    SELECT 1 FROM team_domains 
    WHERE "teamId" = t.id AND name = 'thatworks.agency'
);

-- Final check
SELECT 'Setup Complete!' as status;
SELECT 'Team: ' || name || ' (invites required: ' || "inviteRequired" || ')' as info FROM teams WHERE subdomain = 'thatworks';
SELECT 'User: ' || email || ' (' || role || ')' as info FROM users WHERE email = 'jacob@thatworks.agency';
SELECT 'Allowed domains: ' || string_agg(name, ', ') as info FROM team_domains WHERE "teamId" IN (SELECT id FROM teams WHERE subdomain = 'thatworks');
SELECT 'Auth enabled: Google' as info WHERE EXISTS (SELECT 1 FROM authentication_providers WHERE name = 'google' AND enabled = true);
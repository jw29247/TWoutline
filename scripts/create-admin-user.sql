-- SQL script to create first admin user when team exists but user wasn't created

-- First, check existing teams
SELECT id, name, subdomain, "createdAt" FROM teams ORDER BY "createdAt" DESC;

-- Check if users exist
SELECT u.id, u.name, u.email, u.role, t.name as team_name 
FROM users u 
JOIN teams t ON u."teamId" = t.id
LIMIT 10;

-- Create admin user (replace values as needed)
-- IMPORTANT: Replace 'YOUR_TEAM_ID' with the actual team ID from the first query
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
  gen_random_uuid(),
  'admin@thatworks.agency', -- Your email
  'Admin User', -- Your name
  'admin',
  'YOUR_TEAM_ID', -- Replace with actual team ID
  true,
  false,
  NOW(),
  NOW(),
  NOW()
);

-- After creating the user, you should be able to sign in with Google OAuth
-- Navigate to: https://outline.workshub.agency/auth/google
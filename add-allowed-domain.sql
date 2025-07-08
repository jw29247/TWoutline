-- SQL script to add thatworks.agency as an allowed domain for your team
-- Replace 'YOUR_TEAM_ID' with your actual team ID

-- First, find your team ID
SELECT id, name, subdomain FROM teams;

-- Then add the allowed domain (replace the team_id value)
INSERT INTO team_domains (id, name, "teamId", "createdAt", "updatedAt", "createdById")
VALUES (
  gen_random_uuid(),
  'thatworks.agency',
  'YOUR_TEAM_ID', -- Replace with your actual team ID from the query above
  NOW(),
  NOW(),
  'YOUR_USER_ID' -- Replace with an admin user ID
);
-- First Launch Setup Script for Outline
-- This prepares the system with team, admin user, and allowed domains

-- Check if any teams exist
SELECT COUNT(*) as team_count FROM teams;

-- Check if any users exist
SELECT COUNT(*) as user_count FROM users;

-- Create the main team if it doesn't exist
DO $$
DECLARE
    team_id UUID;
    user_id UUID;
    auth_provider_id UUID;
BEGIN
    -- Check if a team already exists
    SELECT id INTO team_id FROM teams LIMIT 1;
    
    IF team_id IS NULL THEN
        -- Create the team
        team_id := gen_random_uuid();
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
            team_id,
            'ThatWorks Agency',
            'thatworks',
            'member',
            false,  -- Don't require invites
            true,   -- Enable sharing
            true,   -- Enable guest signin
            true,   -- Enable document embeds
            true,   -- Members can create collections
            true,   -- Members can create in team
            0,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Created team: ThatWorks Agency (ID: %)', team_id;
    ELSE
        RAISE NOTICE 'Team already exists (ID: %)', team_id;
    END IF;
    
    -- Ensure the team allows signups without invites
    UPDATE teams 
    SET "inviteRequired" = false,
        "updatedAt" = NOW()
    WHERE id = team_id AND "inviteRequired" = true;
    
    -- Check if allowed domain exists
    IF NOT EXISTS (
        SELECT 1 FROM team_domains 
        WHERE "teamId" = team_id AND name = 'thatworks.agency'
    ) THEN
        -- Add allowed domain
        INSERT INTO team_domains (
            id,
            name,
            "teamId",
            "createdAt",
            "updatedAt"
        ) VALUES (
            gen_random_uuid(),
            'thatworks.agency',
            team_id,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Added allowed domain: thatworks.agency';
    END IF;
    
    -- Check if admin user exists
    SELECT id INTO user_id 
    FROM users 
    WHERE email = 'jacob@thatworks.agency' AND "teamId" = team_id;
    
    IF user_id IS NULL THEN
        -- Create admin user
        user_id := gen_random_uuid();
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
            user_id,
            'jacob@thatworks.agency',
            'Jacob',
            'admin',
            team_id,
            true,
            false,
            NOW(),
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Created admin user: jacob@thatworks.agency (ID: %)', user_id;
    ELSE
        -- Update existing user to ensure admin status
        UPDATE users 
        SET role = 'admin',
            "isAdmin" = true,
            "isViewer" = false,
            "suspendedAt" = NULL,
            "updatedAt" = NOW()
        WHERE id = user_id;
        RAISE NOTICE 'Updated user to admin: jacob@thatworks.agency';
    END IF;
    
    -- Check if Google auth provider exists
    SELECT id INTO auth_provider_id
    FROM authentication_providers
    WHERE "teamId" = team_id AND name = 'google';
    
    IF auth_provider_id IS NULL THEN
        -- Create Google auth provider
        INSERT INTO authentication_providers (
            id,
            name,
            "teamId",
            enabled,
            "createdAt",
            "updatedAt"
        ) VALUES (
            gen_random_uuid(),
            'google',
            team_id,
            true,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Created Google authentication provider';
    ELSE
        -- Ensure it's enabled
        UPDATE authentication_providers
        SET enabled = true,
            "updatedAt" = NOW()
        WHERE id = auth_provider_id AND enabled = false;
    END IF;
    
END $$;

-- Final status check
SELECT 
    t.id as team_id,
    t.name as team_name,
    t.subdomain,
    t."inviteRequired",
    COUNT(DISTINCT u.id) as user_count,
    COUNT(DISTINCT td.id) as allowed_domains,
    COUNT(DISTINCT ap.id) as auth_providers
FROM teams t
LEFT JOIN users u ON u."teamId" = t.id
LEFT JOIN team_domains td ON td."teamId" = t.id
LEFT JOIN authentication_providers ap ON ap."teamId" = t.id
GROUP BY t.id, t.name, t.subdomain, t."inviteRequired";

-- Show admin users
SELECT 
    u.email,
    u.name,
    u.role,
    u."isAdmin",
    t.name as team_name
FROM users u
JOIN teams t ON u."teamId" = t.id
WHERE u.role = 'admin' OR u."isAdmin" = true;

-- Show allowed domains
SELECT 
    td.name as domain,
    t.name as team_name
FROM team_domains td
JOIN teams t ON td."teamId" = t.id;

-- Show authentication providers
SELECT 
    ap.name as provider,
    ap.enabled,
    t.name as team_name
FROM authentication_providers ap
JOIN teams t ON ap."teamId" = t.id;
-- Use the existing team
DO $$
DECLARE
    v_team_id UUID;
    v_user_id UUID;
BEGIN
    -- Get the existing team ID
    SELECT id INTO v_team_id FROM teams WHERE subdomain = 'thatworks' LIMIT 1;
    RAISE NOTICE 'Using existing team ID: %', v_team_id;
    
    -- Update team to ensure invites are not required
    UPDATE teams 
    SET "inviteRequired" = false
    WHERE id = v_team_id;
    
    -- Create or update admin user
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
        gen_random_uuid(),
        'jacob@thatworks.agency',
        'Jacob',
        'admin',
        v_team_id,
        NOW(),
        NOW(),
        NOW()
    ) 
    ON CONFLICT (email) DO UPDATE SET
        role = 'admin',
        "teamId" = v_team_id,
        "suspendedAt" = NULL,
        "updatedAt" = NOW()
    RETURNING id INTO v_user_id;
    
    RAISE NOTICE 'User ID: %', v_user_id;
    
    -- Add allowed domain with the admin user as creator
    BEGIN
        INSERT INTO team_domains (
            id,
            name,
            "teamId",
            "createdById",
            "createdAt",
            "updatedAt"
        ) VALUES (
            gen_random_uuid(),
            'thatworks.agency',
            v_team_id,
            v_user_id,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Added allowed domain: thatworks.agency';
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE 'Domain thatworks.agency already exists';
    END;
    
    -- Create Google auth provider
    BEGIN
        INSERT INTO authentication_providers (
            id,
            name,
            "providerId",
            enabled,
            "teamId",
            "createdAt"
        ) VALUES (
            gen_random_uuid(),
            'google',
            'thatworks.agency',
            true,
            v_team_id,
            NOW()
        );
        RAISE NOTICE 'Added Google authentication provider';
    EXCEPTION WHEN unique_violation THEN
        UPDATE authentication_providers
        SET enabled = true
        WHERE "teamId" = v_team_id AND name = 'google';
        RAISE NOTICE 'Enabled existing Google authentication provider';
    END;
END $$;

-- Show final status
SELECT 'Team: ' || t.name || ' (subdomain: ' || COALESCE(t.subdomain, 'none') || ', inviteRequired: ' || t."inviteRequired" || ')' as info
FROM teams t WHERE t.subdomain = 'thatworks';

SELECT 'Admin user: ' || u.email || ' (role: ' || u.role || ')' as info
FROM users u 
JOIN teams t ON u."teamId" = t.id
WHERE t.subdomain = 'thatworks' AND u.email = 'jacob@thatworks.agency';

SELECT 'Allowed domains: ' || string_agg(td.name, ', ') as info
FROM team_domains td 
JOIN teams t ON td."teamId" = t.id
WHERE t.subdomain = 'thatworks';

SELECT 'Auth providers: ' || string_agg(ap.name || ' (' || CASE WHEN ap.enabled THEN 'enabled' ELSE 'disabled' END || ')', ', ') as info
FROM authentication_providers ap
JOIN teams t ON ap."teamId" = t.id
WHERE t.subdomain = 'thatworks';
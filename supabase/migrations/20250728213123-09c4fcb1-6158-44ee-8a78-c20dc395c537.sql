-- Enable RLS on remaining tables without it
ALTER TABLE public.image_batch_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_updates ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for image_batch_uploads (system table - service role only)
CREATE POLICY "Service role only access for image_batch_uploads" 
ON public.image_batch_uploads 
FOR ALL 
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Add RLS policies for price_updates (system table - service role only)  
CREATE POLICY "Service role only access for price_updates" 
ON public.price_updates 
FOR ALL 
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Move extensions out of public schema to improve security
-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_cron extension to extensions schema if it exists in public
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER EXTENSION pg_cron SET SCHEMA extensions;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Extension might not exist or already be in correct schema
        NULL;
END $$;

-- Move pg_net extension to extensions schema if it exists in public
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER EXTENSION pg_net SET SCHEMA extensions;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Extension might not exist or already be in correct schema
        NULL;
END $$;

-- Update extension versions to latest recommended versions
-- This will help address the outdated extensions warning
DO $$
BEGIN
    -- Update pg_cron if it exists
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        ALTER EXTENSION pg_cron UPDATE;
    END IF;
    
    -- Update pg_net if it exists  
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
        ALTER EXTENSION pg_net UPDATE;
    END IF;
    
    -- Update other common extensions
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        ALTER EXTENSION "uuid-ossp" UPDATE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
        ALTER EXTENSION pgcrypto UPDATE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Some extensions might not support updates or already be latest
        NULL;
END $$;
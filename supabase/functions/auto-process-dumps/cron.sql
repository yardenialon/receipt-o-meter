
-- Enable the required extensions if not already enabled
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Schedule the function to run every hour
select
  cron.schedule(
    'process-supermarket-dumps-hourly',  -- unique job name
    '0 * * * *',                        -- run every hour at minute 0
    $$
    select
      net.http_post(
        url:='https://kthqkydgegsoheymesgc.supabase.co/functions/v1/auto-process-dumps',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0aHFreWRnZWdzb2hleW1lc2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5Nzg2ODgsImV4cCI6MjA1MDU1NDY4OH0.Yek0syRgz4mgPmXc7wy-nml-ci1WFWCniwlZhc83Z6s"}'::jsonb
      ) as request_id;
    $$
  );

-- Add a daily schedule for Yeinot Bitan price updates at midnight
select
  cron.schedule(
    'update-yeinot-bitan-prices-daily',  -- unique job name
    '0 0 * * *',                        -- run at 00:00 (midnight) every day
    $$
    select
      net.http_post(
        url:='https://kthqkydgegsoheymesgc.supabase.co/functions/v1/fetch-yeinot-bitan-prices',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0aHFreWRnZWdzb2hleW1lc2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5Nzg2ODgsImV4cCI6MjA1MDU1NDY4OH0.Yek0syRgz4mgPmXc7wy-nml-ci1WFWCniwlZhc83Z6s"}'::jsonb
      ) as request_id;
    $$
  );

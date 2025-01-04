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
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
      ) as request_id;
    $$
  );

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
        headers:=jsonb_build_object(
          'Content-Type', 'application/json', 
          'Authorization', 'Bearer ' || current_setting('app.settings.anon_key', true)
        )
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
        headers:=jsonb_build_object(
          'Content-Type', 'application/json', 
          'Authorization', 'Bearer ' || current_setting('app.settings.anon_key', true)
        )
      ) as request_id;
    $$
  );

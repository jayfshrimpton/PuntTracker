-- Create subscriptions table
create table subscriptions (
  id text primary key, -- Stripe Subscription ID
  user_id uuid references auth.users on delete cascade not null,
  status text check (status in ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused')) not null,
  metadata jsonb,
  price_id text,
  quantity integer,
  cancel_at_period_end boolean,
  created timestamp with time zone default timezone('utc'::text, now()) not null,
  current_period_start timestamp with time zone default timezone('utc'::text, now()) not null,
  current_period_end timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone default timezone('utc'::text, now()),
  cancel_at timestamp with time zone default timezone('utc'::text, now()),
  canceled_at timestamp with time zone default timezone('utc'::text, now()),
  trial_start timestamp with time zone default timezone('utc'::text, now()),
  trial_end timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table subscriptions enable row level security;

-- Policies
create policy "Users can view own subscription" on subscriptions
  for select using ((select auth.uid()) = user_id);

-- Only service role can insert/update/delete (handled via webhook)
-- But for development/testing we might want to allow it if we are seeding, 
-- strictly speaking webhooks should use service_role key which bypasses RLS.

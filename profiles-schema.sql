-- Create profiles table to extend auth.users
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  stripe_customer_id text,
  billing_address jsonb,
  payment_method jsonb
);

-- Enable RLS
alter table profiles enable row level security;

-- Policies
create policy "Users can view own profile" on profiles
  for select using ((select auth.uid()) = id);

create policy "Users can update own profile" on profiles
  for update using ((select auth.uid()) = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

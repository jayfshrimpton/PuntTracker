-- Add bookie column to bets
ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS bookie TEXT;

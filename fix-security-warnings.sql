-- Fix Security Warnings
-- This script updates the handle_new_user function to have a fixed search_path.

-- 1. Fix function_search_path_mutable for handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, email_notifications_enabled)
  VALUES (NEW.id, NEW.email, true)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

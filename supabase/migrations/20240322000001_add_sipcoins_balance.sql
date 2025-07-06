-- Add sipcoins_balance column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS sipcoins_balance INTEGER DEFAULT 0;

-- Add comment to explain the field
COMMENT ON COLUMN public.profiles.sipcoins_balance IS 'User''s current SipCoins balance for rewards and redemptions';

-- Create index for better query performance on balance lookups
CREATE INDEX IF NOT EXISTS profiles_sipcoins_balance_idx ON public.profiles(sipcoins_balance); 
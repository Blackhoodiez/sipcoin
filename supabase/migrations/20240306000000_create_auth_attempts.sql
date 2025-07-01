-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create auth_attempts table
CREATE TABLE IF NOT EXISTS public.auth_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL,
    email TEXT NOT NULL,
    attempt_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_auth_attempts_ip_email ON public.auth_attempts(ip_address, email);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_expires ON public.auth_attempts(expires_at);

-- Enable Row Level Security
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to manage auth attempts
CREATE POLICY "Service role can manage auth attempts"
    ON public.auth_attempts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policy to allow authenticated users to read their own attempts
CREATE POLICY "Users can read their own attempts"
    ON public.auth_attempts
    FOR SELECT
    TO authenticated
    USING (email = auth.jwt()->>'email');

-- Create function to clean up expired attempts
CREATE OR REPLACE FUNCTION public.cleanup_expired_auth_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.auth_attempts
    WHERE expires_at < NOW();
END;
$$;

-- Create a scheduled job to clean up expired attempts every hour
SELECT cron.schedule(
    'cleanup-expired-auth-attempts',
    '0 * * * *',  -- Every hour
    $$SELECT public.cleanup_expired_auth_attempts()$$
); 
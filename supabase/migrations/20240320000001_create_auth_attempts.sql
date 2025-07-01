-- Create auth_attempts table
CREATE TABLE IF NOT EXISTS auth_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL,
    email TEXT NOT NULL,
    attempt_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS auth_attempts_ip_address_created_at_idx 
ON auth_attempts(ip_address, created_at);

CREATE INDEX IF NOT EXISTS auth_attempts_email_type_idx 
ON auth_attempts(email, attempt_type);

CREATE INDEX IF NOT EXISTS auth_attempts_expires_at_idx 
ON auth_attempts(expires_at);

-- Add RLS policies
ALTER TABLE auth_attempts ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage auth attempts
CREATE POLICY "Service role can manage auth attempts"
    ON auth_attempts
    FOR ALL
    USING (auth.role() = 'service_role');

-- Prevent regular users from accessing auth attempts
CREATE POLICY "No access for regular users"
    ON auth_attempts
    FOR ALL
    USING (false);

-- Create function to clean up old attempts
CREATE OR REPLACE FUNCTION cleanup_old_auth_attempts()
RETURNS void AS $$
BEGIN
    DELETE FROM auth_attempts
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up old attempts every hour
SELECT cron.schedule(
    'cleanup-auth-attempts',
    '0 * * * *',  -- Run every hour
    $$SELECT cleanup_old_auth_attempts()$$
); 
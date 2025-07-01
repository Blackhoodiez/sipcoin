-- Create password history table
CREATE TABLE IF NOT EXISTS password_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT password_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS password_history_user_id_idx ON password_history(user_id);

-- Add RLS policies
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own password history
CREATE POLICY "Users can read their own password history"
    ON password_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own password history
CREATE POLICY "Users can insert their own password history"
    ON password_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Prevent users from modifying or deleting password history
CREATE POLICY "No modifications to password history"
    ON password_history
    FOR ALL
    USING (false); 
-- Create enum for receipt status
CREATE TYPE receipt_status AS ENUM ('pending', 'processing', 'processed', 'failed', 'rejected');

-- Create receipts table
CREATE TABLE receipts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    ocr_text TEXT,
    total_amount DECIMAL(10,2),
    merchant_name TEXT,
    merchant_address TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE,
    transaction_time TIME,
    tax_amount DECIMAL(10,2),
    subtotal_amount DECIMAL(10,2),
    sipcoins_earned INTEGER DEFAULT 0,
    status receipt_status DEFAULT 'pending',
    error_message TEXT,
    processing_attempts INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX receipts_user_id_idx ON receipts(user_id);
CREATE INDEX receipts_status_idx ON receipts(status);
CREATE INDEX receipts_created_at_idx ON receipts(created_at);
CREATE INDEX receipts_transaction_date_idx ON receipts(transaction_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_receipts_updated_at
    BEFORE UPDATE ON receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view only their own receipts
CREATE POLICY "Users can view their own receipts"
    ON receipts FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own receipts
CREATE POLICY "Users can insert their own receipts"
    ON receipts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own receipts
CREATE POLICY "Users can update their own receipts"
    ON receipts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE receipts IS 'Stores receipt information and OCR processing results for sipcoin calculations'; 
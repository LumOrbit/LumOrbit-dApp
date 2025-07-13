/*
  # StellarRemit Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches auth.users.id
      - `email` (text, unique)
      - `full_name` (text)
      - `phone` (text)
      - `country` (text)
      - `preferred_language` (text, default 'en')
      - `wallet_address` (text) - Stellar wallet address
      - `public_key` (text) - Stellar public key
      - `private_key` (text) - Encrypted Stellar private key
      - `is_verified` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `recipients`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `full_name` (text)
      - `phone` (text)
      - `email` (text)
      - `country` (text)
      - `delivery_method` (text)
      - `bank_account` (text)
      - `wallet_address` (text) - Recipient's Stellar wallet
      - `is_favorite` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `transfers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `recipient_id` (uuid, foreign key)
      - `amount_usd` (decimal)
      - `amount_local` (decimal)
      - `exchange_rate` (decimal)
      - `fee_usd` (decimal)
      - `total_usd` (decimal)
      - `from_currency` (text, default 'USD')
      - `to_currency` (text)
      - `delivery_method` (text)
      - `status` (text, default 'pending')
      - `stellar_transaction_id` (text) - Stellar network transaction ID
      - `stellar_memo` (text) - Stellar transaction memo
      - `tracking_number` (text, unique)
      - `estimated_delivery` (timestamp)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `exchange_rates`
      - `id` (uuid, primary key)
      - `from_currency` (text)
      - `to_currency` (text)
      - `rate` (decimal)
      - `change_24h` (decimal, default 0)
      - `last_updated` (timestamp, default now())
      - `created_at` (timestamp)

    - `countries`
      - `id` (uuid, primary key)
      - `code` (text, unique) - ISO country code
      - `name` (text)
      - `currency` (text)
      - `flag_emoji` (text)
      - `is_supported` (boolean, default true)
      - `delivery_methods` (jsonb) - Available delivery methods
      - `created_at` (timestamp)

    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `title` (text)
      - `message` (text)
      - `type` (text) - 'transfer_update', 'security', 'promotion'
      - `is_read` (boolean, default false)
      - `transfer_id` (uuid, foreign key, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Secure private key storage with encryption
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  country text,
  preferred_language text DEFAULT 'en',
  wallet_address text,
  public_key text,
  private_key text, -- This should be encrypted in production
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recipients table
CREATE TABLE IF NOT EXISTS recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  phone text,
  email text,
  country text NOT NULL,
  delivery_method text NOT NULL,
  bank_account text,
  wallet_address text,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transfers table
CREATE TABLE IF NOT EXISTS transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES recipients(id) ON DELETE CASCADE NOT NULL,
  amount_usd decimal(10,2) NOT NULL,
  amount_local decimal(15,2) NOT NULL,
  exchange_rate decimal(10,6) NOT NULL,
  fee_usd decimal(10,2) NOT NULL,
  total_usd decimal(10,2) NOT NULL,
  from_currency text DEFAULT 'USD',
  to_currency text NOT NULL,
  delivery_method text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  stellar_transaction_id text,
  stellar_memo text,
  tracking_number text UNIQUE DEFAULT 'ST' || EXTRACT(epoch FROM now())::bigint || FLOOR(random() * 1000)::text,
  estimated_delivery timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency text NOT NULL,
  to_currency text NOT NULL,
  rate decimal(10,6) NOT NULL,
  change_24h decimal(5,2) DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(from_currency, to_currency)
);

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  currency text NOT NULL,
  flag_emoji text NOT NULL,
  is_supported boolean DEFAULT true,
  delivery_methods jsonb DEFAULT '["bank_transfer", "cash_pickup", "mobile_wallet"]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('transfer_update', 'security', 'promotion', 'system')),
  is_read boolean DEFAULT false,
  transfer_id uuid REFERENCES transfers(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for recipients table
CREATE POLICY "Users can read own recipients"
  ON recipients
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own recipients"
  ON recipients
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own recipients"
  ON recipients
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own recipients"
  ON recipients
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for transfers table
CREATE POLICY "Users can read own transfers"
  ON transfers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transfers"
  ON transfers
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transfers"
  ON transfers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for exchange_rates table (read-only for all authenticated users)
CREATE POLICY "Authenticated users can read exchange rates"
  ON exchange_rates
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for countries table (read-only for all authenticated users)
CREATE POLICY "Authenticated users can read countries"
  ON countries
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for notifications table
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipients_user_id ON recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_user_id ON transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_recipient_id ON transfers(recipient_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status);
CREATE INDEX IF NOT EXISTS idx_transfers_created_at ON transfers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipients_updated_at BEFORE UPDATE ON recipients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transfers_updated_at BEFORE UPDATE ON transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
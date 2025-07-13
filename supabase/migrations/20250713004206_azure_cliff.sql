/*
  # Seed Initial Data for StellarRemit

  1. Countries and Exchange Rates
    - Add supported countries with delivery methods
    - Add initial exchange rates for major currencies

  2. Sample Data
    - Add sample exchange rates for testing
*/

-- Insert supported countries
INSERT INTO countries (code, name, currency, flag_emoji, delivery_methods) VALUES
  ('MX', 'Mexico', 'MXN', '🇲🇽', '["bank_transfer", "cash_pickup", "mobile_wallet"]'::jsonb),
  ('PH', 'Philippines', 'PHP', '🇵🇭', '["bank_transfer", "cash_pickup", "mobile_wallet", "gcash"]'::jsonb),
  ('IN', 'India', 'INR', '🇮🇳', '["bank_transfer", "mobile_wallet", "upi"]'::jsonb),
  ('GT', 'Guatemala', 'GTQ', '🇬🇹', '["bank_transfer", "cash_pickup"]'::jsonb),
  ('CO', 'Colombia', 'COP', '🇨🇴', '["bank_transfer", "cash_pickup", "mobile_wallet"]'::jsonb),
  ('PE', 'Peru', 'PEN', '🇵🇪', '["bank_transfer", "cash_pickup"]'::jsonb),
  ('EC', 'Ecuador', 'USD', '🇪🇨', '["bank_transfer", "cash_pickup"]'::jsonb),
  ('SV', 'El Salvador', 'USD', '🇸🇻', '["bank_transfer", "cash_pickup", "bitcoin"]'::jsonb),
  ('HN', 'Honduras', 'HNL', '🇭🇳', '["bank_transfer", "cash_pickup"]'::jsonb),
  ('NI', 'Nicaragua', 'NIO', '🇳🇮', '["bank_transfer", "cash_pickup"]'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- Insert initial exchange rates
INSERT INTO exchange_rates (from_currency, to_currency, rate, change_24h) VALUES
  ('USD', 'MXN', 18.45, 0.25),
  ('USD', 'PHP', 56.20, -0.15),
  ('USD', 'INR', 83.12, 0.42),
  ('USD', 'GTQ', 7.85, 0.05),
  ('USD', 'COP', 4125.50, -12.30),
  ('USD', 'PEN', 3.75, 0.02),
  ('USD', 'HNL', 24.65, 0.08),
  ('USD', 'NIO', 36.85, 0.12)
ON CONFLICT (from_currency, to_currency) DO UPDATE SET
  rate = EXCLUDED.rate,
  change_24h = EXCLUDED.change_24h,
  last_updated = now();
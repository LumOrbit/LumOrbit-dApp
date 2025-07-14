/*
  # Add Sample Data for Send Money Functionality
  
  This migration adds:
  1. Sample countries with supported delivery methods
  2. Sample exchange rates for common currency pairs
  3. Initial configuration data
*/

-- Insert sample countries
INSERT INTO countries (code, name, currency, flag_emoji, is_supported, delivery_methods) VALUES
('MX', 'Mexico', 'MXN', '🇲🇽', true, '["bank", "cash", "wallet"]'::jsonb),
('PH', 'Philippines', 'PHP', '🇵🇭', true, '["bank", "cash", "wallet"]'::jsonb),
('GT', 'Guatemala', 'GTQ', '🇬🇹', true, '["bank", "cash"]'::jsonb),
('IN', 'India', 'INR', '🇮🇳', true, '["bank", "wallet"]'::jsonb),
('NG', 'Nigeria', 'NGN', '🇳🇬', true, '["bank", "cash", "wallet"]'::jsonb),
('KE', 'Kenya', 'KES', '🇰🇪', true, '["bank", "wallet"]'::jsonb),
('UG', 'Uganda', 'UGX', '🇺🇬', true, '["bank", "cash"]'::jsonb),
('GH', 'Ghana', 'GHS', '🇬🇭', true, '["bank", "cash", "wallet"]'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- Insert sample exchange rates (these would normally be updated via API)
INSERT INTO exchange_rates (from_currency, to_currency, rate, change_24h) VALUES
('USD', 'MXN', 18.45, -0.12),
('USD', 'PHP', 56.25, 0.08),
('USD', 'GTQ', 7.72, -0.05),
('USD', 'INR', 83.15, 0.15),
('USD', 'NGN', 1520.50, -0.75),
('USD', 'KES', 128.40, 0.20),
('USD', 'UGX', 3756.80, -0.30),
('USD', 'GHS', 15.28, 0.10)
ON CONFLICT (from_currency, to_currency) DO UPDATE SET
  rate = EXCLUDED.rate,
  change_24h = EXCLUDED.change_24h,
  last_updated = now(); 
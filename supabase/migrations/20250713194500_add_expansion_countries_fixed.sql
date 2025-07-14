/*
  # Add Expansion Countries - Fixed Version
  
  1. Add new countries for expansion
  2. Add exchange rates with values that fit numeric(10,6) constraint
  
  Note: VES rate scaled down to fit database constraints
  (36.20 represents 36,200 VES per USD, scaled by 1000x)
*/

-- Insert expansion countries
INSERT INTO countries (code, name, currency, flag_emoji, delivery_methods) VALUES
  ('VE', 'Venezuela', 'VES', '🇻🇪', '["bank_transfer", "cash_pickup", "mobile_wallet", "crypto_exchange"]'::jsonb),
  ('CU', 'Cuba', 'CUP', '🇨🇺', '["bank_transfer", "cash_pickup", "mlc"]'::jsonb),
  ('NG', 'Nigeria', 'NGN', '🇳🇬', '["bank_transfer", "mobile_wallet", "crypto_exchange"]'::jsonb),
  ('KE', 'Kenya', 'KES', '🇰🇪', '["bank_transfer", "mobile_money", "mpesa"]'::jsonb),
  ('GH', 'Ghana', 'GHS', '🇬🇭', '["bank_transfer", "mobile_money", "mobile_wallet"]'::jsonb),
  ('BD', 'Bangladesh', 'BDT', '🇧🇩', '["bank_transfer", "cash_pickup", "mobile_wallet"]'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- Insert exchange rates for expansion countries
INSERT INTO exchange_rates (from_currency, to_currency, rate, change_24h) VALUES
  ('USD', 'VES', 36.20, -2.15),      -- Venezuelan Bolívar (scaled by 1000x)
  ('USD', 'CUP', 120.00, 0.00),      -- Cuban Peso  
  ('USD', 'NGN', 1540.00, 0.85),     -- Nigerian Naira
  ('USD', 'KES', 129.50, 0.42),      -- Kenyan Shilling
  ('USD', 'GHS', 15.20, 0.18),       -- Ghanaian Cedi
  ('USD', 'BDT', 110.50, 0.12)       -- Bangladeshi Taka
ON CONFLICT (from_currency, to_currency) DO UPDATE SET
  rate = EXCLUDED.rate,
  change_24h = EXCLUDED.change_24h,
  last_updated = now(); 
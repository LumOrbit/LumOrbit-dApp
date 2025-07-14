/*
  # Sync Auth Users with Public Users Table
  
  1. Create function to handle new user creation
  2. Create trigger to automatically sync new users
  3. Insert existing users from auth.users to public.users
*/

-- Function to sync new users from auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    full_name,
    phone,
    country,
    is_verified,
    wallet_address,
    public_key,
    private_key,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'country', ''),
    CASE WHEN new.email_confirmed_at IS NOT NULL THEN true ELSE false END,
    NULL, -- wallet_address will be populated by the app after wallet creation
    NULL, -- public_key will be populated by the app after wallet creation
    NULL, -- private_key will be populated by the app after wallet creation
    new.created_at,
    now()
  );
  RETURN new;
END;
$$;

-- Trigger to execute the function when a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert existing users from auth.users to public.users (if they don't exist)
INSERT INTO public.users (
  id, 
  email, 
  full_name,
  phone,
  country,
  is_verified,
  wallet_address,
  public_key,
  private_key,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  COALESCE(au.raw_user_meta_data->>'phone', ''),
  COALESCE(au.raw_user_meta_data->>'country', ''),
  CASE WHEN au.email_confirmed_at IS NOT NULL THEN true ELSE false END,
  NULL, -- existing users will need to have wallets created separately
  NULL, -- existing users will need to have wallets created separately
  NULL, -- existing users will need to have wallets created separately
  au.created_at,
  now()
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.users);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT SELECT ON auth.users TO postgres; 
-- Automatically keep public.profiles in sync when users sign up or link OAuth providers (e.g. Google)
CREATE OR REPLACE FUNCTION public.handle_auth_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  derived_name text;
BEGIN
  derived_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    NULLIF(TRIM(split_part(COALESCE(NEW.email, ''), '@', 1)), '')
  );

  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, derived_name, COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(NULLIF(TRIM(public.profiles.full_name), ''), EXCLUDED.full_name),
    email = COALESCE(NULLIF(TRIM(EXCLUDED.email), ''), public.profiles.email);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_profile_sync ON auth.users;

CREATE TRIGGER on_auth_user_profile_sync
AFTER INSERT OR UPDATE OF email, raw_user_meta_data ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_auth_user_profile();

-- Backfill existing auth.users rows that do not yet have a row in public.profiles
INSERT INTO public.profiles (id, full_name, email)
SELECT
  u.id,
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''),
    NULLIF(TRIM(split_part(COALESCE(u.email, ''), '@', 1)), '')
  ) AS full_name,
  COALESCE(u.email, '') AS email
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);


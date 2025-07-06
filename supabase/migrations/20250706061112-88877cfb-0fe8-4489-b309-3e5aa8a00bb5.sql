-- Create an enum for application roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create the user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  )
$$;

-- Create a function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS TABLE(role app_role, assigned_at TIMESTAMP WITH TIME ZONE)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT ur.role, ur.assigned_at
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
    AND ur.is_active = true
  ORDER BY ur.assigned_at DESC
$$;

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert initial admin role for the admin email
-- This will need to be done after a user with admin@hooks.app signs up
-- For now, we'll create a function to assign admin role
CREATE OR REPLACE FUNCTION public.assign_admin_role(_email TEXT)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  _user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO _user_id
  FROM auth.users
  WHERE email = _email;
  
  -- If user exists, assign admin role
  IF _user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, assigned_by)
    VALUES (_user_id, 'admin', _user_id)
    ON CONFLICT (user_id, role) 
    DO UPDATE SET is_active = true, assigned_at = now();
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Auto-assign admin role to specific emails on signup
CREATE OR REPLACE FUNCTION public.auto_assign_admin_roles()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  admin_emails TEXT[] := ARRAY['admin@hooks.app', 'admin@hook.app', 'creator@hooks.app'];
BEGIN
  -- Check if new user email is in admin list
  IF NEW.email = ANY(admin_emails) THEN
    INSERT INTO public.user_roles (user_id, role, assigned_by)
    VALUES (NEW.id, 'admin', NEW.id)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Assign default user role
    INSERT INTO public.user_roles (user_id, role, assigned_by)
    VALUES (NEW.id, 'user', NEW.id)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign roles on user creation
CREATE TRIGGER auto_assign_user_roles
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_admin_roles();
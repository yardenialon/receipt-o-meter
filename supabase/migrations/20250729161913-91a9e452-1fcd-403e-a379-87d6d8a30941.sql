-- יצירת enum לתפקידים
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- יצירת טבלת תפקידי משתמשים
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- הפעלת RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- יצירת פונקציה לבדיקת תפקיד (security definer כדי לעקוף RLS)
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
  )
$$;

-- פוליסה לצפייה בתפקידים (רק המשתמש עצמו יכול לראות את התפקיד שלו)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- הוספת המשתמש הנוכחי כמנהל (לפי המייל שנתת)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'yardenialon5@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
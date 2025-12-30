-- 1. Modificar la restricción (Constraint) de roles para permitir 'admin'
-- Primero eliminamos la constraint vieja si existe
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Agregamos la nueva con 'admin'
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('cliente', 'prestador', 'admin'));

-- 2. Políticas de Seguridad (RLS) para Admins
-- Permitir que el admin vea TODO en la tabla profiles
CREATE POLICY "Admins view all profiles"
ON profiles FOR SELECT
USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Permitir que el admin modifique TODO (para bans, verificaciones, etc)
CREATE POLICY "Admins update all profiles"
ON profiles FOR UPDATE
USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Repetimos para Services (Moderación)
CREATE POLICY "Admins update all services"
ON services FOR UPDATE
USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Repetimos para Reviews (Moderación)
CREATE POLICY "Admins delete reviews"
ON reviews FOR DELETE
USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- NOTA: Para convertirte en admin, corré la siguiente linea:
UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'josevarnal@gmail.com');

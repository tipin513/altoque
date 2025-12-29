-- Reemplazá 'email_del_usuario@ejemplo.com' por el email real del usuario que querés verificar

UPDATE profiles
SET 
  is_identity_verified = true,      -- Poné false si querés quitar la verificación
  is_professional_verified = true   -- Poné false si querés quitar la verificación
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'email_del_usuario@ejemplo.com'
);

-- Para verificar que se aplicó:
-- SELECT * FROM profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'email_del_usuario@ejemplo.com');

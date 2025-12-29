-- Agregar columna para el usuario de Instagram (sin @)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS instagram_handle TEXT;

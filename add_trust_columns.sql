-- Agregar columnas de verificación de confianza
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_identity_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_professional_verified BOOLEAN DEFAULT false;

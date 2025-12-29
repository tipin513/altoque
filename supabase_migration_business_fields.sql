-- ============================================
-- MIGRACIÓN: Agregar campos de empresa/negocio
-- ============================================
-- Ejecutar en Supabase SQL Editor

-- Agregar campos para información de empresa/negocio
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS legal_name TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS social_media TEXT,
ADD COLUMN IF NOT EXISTS business_hours TEXT,
ADD COLUMN IF NOT EXISTS years_in_business INTEGER;

-- Verificar que los campos se agregaron
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('business_name', 'legal_name', 'logo_url', 'website', 'social_media', 'business_hours', 'years_in_business')
ORDER BY ordinal_position;

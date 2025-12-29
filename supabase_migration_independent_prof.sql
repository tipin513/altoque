-- ============================================
-- MIGRACIÓN: Campos para Profesional Independiente
-- ============================================

-- 1. Agregar tipo de prestador y campos extra
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS provider_type TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS work_mode TEXT;

-- Opcional: Agregar check constraints (puedes ejecutarlos si quieres ser estricto)
-- ALTER TABLE profiles ADD CONSTRAINT check_provider_type CHECK (provider_type IN ('independent', 'business'));
-- ALTER TABLE profiles ADD CONSTRAINT check_work_mode CHECK (work_mode IN ('solo', 'helper'));

-- Verificar columnas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('provider_type', 'bio', 'work_mode');

-- ============================================
-- MIGRACIÓN: Requisitos Legales para Empresas
-- ============================================

-- Agregar columnas para datos fiscales y documentación
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS cuit TEXT,
ADD COLUMN IF NOT EXISTS fiscal_address TEXT,
ADD COLUMN IF NOT EXISTS legal_docs_url TEXT,
ADD COLUMN IF NOT EXISTS certificates_url TEXT;

-- Verificar validación (opcional, por ahora permitimos nulos en DB pero validamos en UI)
-- Si quisiéramos hacerlo estricto en DB para businesses:
-- ALTER TABLE profiles ADD CONSTRAINT check_cuit_business CHECK (
--   (provider_type = 'business' AND cuit IS NOT NULL) OR (provider_type <> 'business')
-- );

-- Verificar columnas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('cuit', 'fiscal_address', 'legal_docs_url', 'certificates_url');

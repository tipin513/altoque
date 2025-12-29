-- 1. Actualizar tabla profiles con estados detallados
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS identity_status TEXT DEFAULT 'unverified' CHECK (identity_status IN ('unverified', 'pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS professional_status TEXT DEFAULT 'unverified' CHECK (professional_status IN ('unverified', 'pending', 'verified', 'rejected'));

-- 2. Crear tabla de solicitudes de verificación (para guardar los documentos de forma segura)
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('identity', 'professional')) NOT NULL,
  document_urls TEXT[] NOT NULL, -- Array de URLs de los documentos subidos
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT, -- Notas del admin (ej: "Foto borrosa, volver a subir")
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar RLS en la nueva tabla
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Política: El usuario solo puede ver sus propias solicitudes
CREATE POLICY "Users view own requests" ON verification_requests 
FOR SELECT USING (auth.uid() = user_id);

-- Política: El usuario puede crear solicitudes
CREATE POLICY "Users create requests" ON verification_requests 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Crear bucket privado para documentos
-- Nota: 'private' se maneja con políticas. Por defecto buckets son privados si 'public' es false.
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-docs', 'verification-docs', false) -- FALSE = Privado (no accesible por URL pública sin token)
ON CONFLICT (id) DO NOTHING;

-- 5. Políticas de Storage
-- Solo el usuario dueño puede subir
CREATE POLICY "Users upload verification docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-docs' 
  AND auth.uid() = (storage.foldername(name))[1]::uuid -- Estructura carpeta: user_id/filename
);

-- Solo el usuario dueño puede ver sus docs (para previsualizar si hiciera falta, aunque idealmente es write-only para user, read-only para admin)
CREATE POLICY "Users view own verification docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-docs' 
  AND auth.uid() = (storage.foldername(name))[1]::uuid
);

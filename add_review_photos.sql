-- 1. Agregar columna de fotos a la tabla reviews
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS photos TEXT[]; -- Array de URLs de imágenes

-- 2. Crear bucket de almacenamiento para imágenes de reseñas si no existe
-- Nota: La creación de buckets suele requerir permisos de admin o hacerse desde el dashboard,
-- pero intentamos insertarlo en storage.buckets si es posible por SQL (depende de extensiones).
-- Lo más seguro es instruir hacerlo desde el dashboard o usar funciones de storage.

INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de seguridad para el bucket storage
-- Permitir acceso público de lectura
CREATE POLICY "Public Access Review Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'review-images' );

-- Permitir a usuarios autenticados subir imágenes
CREATE POLICY "Authenticated Users Upload Review Images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'review-images' 
  AND auth.role() = 'authenticated'
);

-- Permitir a usuarios borrar sus propias imágenes (opcional, por seguridad inicial solo insert)

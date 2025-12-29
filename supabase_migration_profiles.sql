-- Script para agregar nuevos campos a la tabla profiles
-- Ejecutar esto en el SQL Editor de Supabase

-- Agregar campos de nombre separados
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Agregar campo de ubicación
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_id BIGINT REFERENCES locations(id);

-- Agregar campo de dirección aproximada
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- Agregar campo de preferencias de servicios
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS service_preferences TEXT;

-- Actualizar los nombres existentes (opcional, para migrar datos)
-- UPDATE profiles SET first_name = split_part(full_name, ' ', 1), last_name = split_part(full_name, ' ', 2) WHERE first_name IS NULL;

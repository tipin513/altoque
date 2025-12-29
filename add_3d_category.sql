-- ============================================
-- AGREGAR CATEGORÍA: Render/Diseño 3D
-- ============================================
-- Ejecutar este script en Supabase SQL Editor

INSERT INTO categories (name, slug) 
VALUES ('Render/Diseño 3D', 'render-diseno-3d');

-- Verificar que se agregó correctamente
SELECT * FROM categories WHERE slug = 'render-diseno-3d';

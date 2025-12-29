-- 1. Eliminar la categoría redundante 'fletes' (ID 26 o la que tenga ese slug)
DELETE FROM categories 
WHERE slug = 'fletes';

-- 2. Actualizar la categoría 'fletes-mudanzas' para asegurar que tenga el icono correcto
UPDATE categories 
SET icon = 'Truck' 
WHERE slug = 'fletes-mudanzas';

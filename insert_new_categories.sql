-- Insert new categories and update existing ones
INSERT INTO categories (name, slug, icon) VALUES
('Cadetería', 'cadeteria', 'HardHat'),
('Remis', 'remis', 'CarFront'),
('Fletes y Mudanzas', 'fletes', 'Truck')
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, 
    icon = EXCLUDED.icon;

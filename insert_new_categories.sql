-- Insert new categories and update existing ones
INSERT INTO categories (name, slug, icon_name) VALUES
('Cadetería', 'cadeteria', 'Bike'),
('Remis', 'remis', 'Car'),
('Fletes', 'fletes', 'Truck')
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, 
    icon_name = EXCLUDED.icon_name;

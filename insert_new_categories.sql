-- Insert new categories
INSERT INTO categories (name, slug, icon_name) VALUES
('Cadetería', 'cadeteria', 'Bike'),
('Remis / Flete', 'remis', 'Car')
ON CONFLICT (slug) DO NOTHING;

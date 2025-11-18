-- ============================================
-- Add Missing Plant Protection Subcategories
-- ============================================
-- This adds more specific pesticides and weedicides categories

-- First, get the Plant Protection parent ID to use
-- You can run this to verify it exists:
-- SELECT id FROM categories WHERE name = 'Plant Protection' AND parent_id IS NULL;

-- Now add the new subcategories
INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Pesticides', 'General purpose pesticides and bug killers', '🧪', (SELECT id FROM categories WHERE name = 'Plant Protection' AND parent_id IS NULL LIMIT 1), 'Wide-spectrum pest control products. Effective against multiple insect types. Follow safety instructions carefully.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Weedicides', 'Herbicides and weed killers', '🌿', (SELECT id FROM categories WHERE name = 'Plant Protection' AND parent_id IS NULL LIMIT 1), 'Remove unwanted weeds effectively. Pre-emergent and post-emergent options. Apply according to crop type.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Rodent & Pest Control', 'Rodent traps and animal pest control', '🐭', (SELECT id FROM categories WHERE name = 'Plant Protection' AND parent_id IS NULL LIMIT 1), 'Control rats, mice, and other pests. Humane and chemical options. Protect grain storage and farms.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Nematicides', 'Nematode control products', '🔬', (SELECT id FROM categories WHERE name = 'Plant Protection' AND parent_id IS NULL LIMIT 1), 'Combat soil nematodes that damage roots. Increase crop yields by protecting plant roots.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Soil Disinfectants', 'Soil treatment and sterilization products', '⚗️', (SELECT id FROM categories WHERE name = 'Plant Protection' AND parent_id IS NULL LIMIT 1), 'Treat contaminated soil. Kill pathogens and harmful microbes. Prepare soil for planting.');

-- Verify the additions
-- SELECT COUNT(*) as total FROM categories WHERE parent_id = (SELECT id FROM categories WHERE name = 'Plant Protection' AND parent_id IS NULL);
-- Should now show 9 instead of 4

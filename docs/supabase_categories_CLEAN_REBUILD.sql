-- ============================================
-- AgriBuyX Categories - COMPLETE RESET & REBUILD
-- ============================================
-- WARNING: This deletes ALL existing categories and rebuilds them fresh
-- with hierarchy and helper text from scratch

-- ============================================
-- STEP 1: DELETE ALL EXISTING CATEGORIES
-- ============================================
-- This will cascade delete all products associated with these categories
DELETE FROM categories;

-- ============================================
-- STEP 2: INSERT ALL MAIN CATEGORIES (8 total)
-- ============================================

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Seeds & Seedlings', 'Complete range of seeds and seedlings for agriculture', '🌱', NULL, 'Browse all seed and seedling products. From amateur vegetable seeds to commercial-grade fruit tree seedlings. Perfect for starting your garden or farm.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Fertilizers & Substrates', 'Fertilizers, soils and growing media', '🧪', NULL, 'All nutrients your plants need. From organic composts to precision NPK formulations. Professional-grade and beginner-friendly options.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Plant Protection', 'Pesticides and plant protection products', '🛡️', NULL, 'Protect your crops from pests and diseases. Chemical and organic solutions. Professional guidance included.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Irrigation', 'Complete irrigation systems and equipment', '💧', NULL, 'Water your crops efficiently. Drip systems, sprinklers, pumps, and hoses. Save water and increase yields.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Livestock & Pets', 'Feed and supplies for animals', '🐾', NULL, 'Complete care for livestock and pets. Nutrition, health products, housing, and equipment. From chickens to cattle.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Machinery & Tools', 'Garden and farm equipment', '🔧', NULL, 'Power and hand tools for every job. Tractors, tillers, chainsaws, and accessories. New and used equipment.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Repairs & Services', 'Equipment repair and maintenance services', '🔨', NULL, 'Professional repair and maintenance services. Get your equipment fixed fast by experts.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Other Products', 'Miscellaneous agricultural products', '📦', NULL, 'Diverse agricultural items. Storage, safety equipment, monitoring tools, and specialty products.');

-- ============================================
-- STEP 3: SEEDS & SEEDLINGS SUBCATEGORIES (6)
-- ============================================

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Vegetable Seeds - Amateur', 'Beginner-friendly vegetable seed varieties', '🌿', (SELECT id FROM categories WHERE name = 'Seeds & Seedlings' AND parent_id IS NULL LIMIT 1), 'Great for home gardeners. Easy to grow vegetables like tomatoes, peppers, and lettuce. Includes growing tips with every purchase.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Vegetable Seeds - Professional', 'High-yield commercial vegetable seeds', '🌾', (SELECT id FROM categories WHERE name = 'Seeds & Seedlings' AND parent_id IS NULL LIMIT 1), 'For farmers and commercial growers. High germination rates and disease-resistant varieties. Wholesale quantities available.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Vegetable Seedlings', 'Pre-grown vegetable seedlings ready to plant', '🌱', (SELECT id FROM categories WHERE name = 'Seeds & Seedlings' AND parent_id IS NULL LIMIT 1), 'Skip the seed stage. Plant immediately into soil. Saves 4-6 weeks vs growing from seeds. Perfect for time-pressed farmers.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Fruit Tree Seeds', 'High-quality fruit tree seedlings and seeds', '🍎', (SELECT id FROM categories WHERE name = 'Seeds & Seedlings' AND parent_id IS NULL LIMIT 1), 'Plant for the future. Mango, guava, citrus, and pawpaw seeds. Full germination guarantee. Growing instructions included.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Cereal Seeds', 'Maize, wheat, barley, and other cereals', '🌾', (SELECT id FROM categories WHERE name = 'Seeds & Seedlings' AND parent_id IS NULL LIMIT 1), 'Staple crop seeds for large-scale farming. Improved varieties with higher yields. Bulk discounts available.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Seed Potatoes', 'High-quality seed potatoes for planting', '🥔', (SELECT id FROM categories WHERE name = 'Seeds & Seedlings' AND parent_id IS NULL LIMIT 1), 'Certified disease-free potatoes for planting. Choose from early, mid, or late varieties. Storage tips provided.');

-- ============================================
-- STEP 4: FERTILIZERS & SUBSTRATES SUBCATEGORIES (4)
-- ============================================

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Nitrogen Fertilizers', 'Nitrogen-based fertilizer products for leafy growth', '⚗️', (SELECT id FROM categories WHERE name = 'Fertilizers & Substrates' AND parent_id IS NULL LIMIT 1), 'Boost leaf and stem growth. Use for vegetables, grains, and leafy crops. Follow dosage instructions for best results.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('NPK & Mineral Fertilizers', 'NPK and mineral fertilizers for general use', '📦', (SELECT id FROM categories WHERE name = 'Fertilizers & Substrates' AND parent_id IS NULL LIMIT 1), 'Complete plant nutrition in one product. Balanced N-P-K ratios for most crops. Easy to apply, fast results.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Organic Fertilizers', 'Natural and organic fertilizer options', '🌿', (SELECT id FROM categories WHERE name = 'Fertilizers & Substrates' AND parent_id IS NULL LIMIT 1), 'Chemical-free, sustainable farming. Improve soil structure and microbes. Perfect for organic certification.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Professional Growing Substrates', 'Growing media for commercial operations', '🪨', (SELECT id FROM categories WHERE name = 'Fertilizers & Substrates' AND parent_id IS NULL LIMIT 1), 'For professional growers. Coco, peat, and soil mixes. Consistent quality for high-volume production.');

-- ============================================
-- STEP 5: PLANT PROTECTION SUBCATEGORIES (4)
-- ============================================

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Fungicides', 'Disease prevention and control products', '🧬', (SELECT id FROM categories WHERE name = 'Plant Protection' AND parent_id IS NULL LIMIT 1), 'Prevent and treat fungal diseases like powdery mildew and rust. Apply preventatively or curatively. Usage instructions included.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Insecticides', 'Pest control and management products', '🐛', (SELECT id FROM categories WHERE name = 'Plant Protection' AND parent_id IS NULL LIMIT 1), 'Control aphids, whiteflies, spider mites, and other insect pests. Liquid or powder forms available. Safe for beneficial insects.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Herbicides', 'Weed control solutions and management', '🌿', (SELECT id FROM categories WHERE name = 'Plant Protection' AND parent_id IS NULL LIMIT 1), 'Eliminate unwanted weeds without harming crops. Selective herbicides for specific weeds. Apply before weeds mature.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Biological Control - Predators', 'Beneficial insects for natural pest control', '🦗', (SELECT id FROM categories WHERE name = 'Plant Protection' AND parent_id IS NULL LIMIT 1), 'Natural pest management. Ladybugs, lacewings, and parasitic wasps. Environmentally friendly and cost-effective long-term.');

-- ============================================
-- STEP 6: IRRIGATION SUBCATEGORIES (5)
-- ============================================

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Drip Irrigation Hoses', 'Professional drip irrigation hoses', '🌊', (SELECT id FROM categories WHERE name = 'Irrigation' AND parent_id IS NULL LIMIT 1), 'Deliver water precisely to plant roots. 30-50% water savings. Easy to install and adjust. Available in various lengths.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Sprinklers', 'Rotating and fixed sprinkler systems', '💦', (SELECT id FROM categories WHERE name = 'Irrigation' AND parent_id IS NULL LIMIT 1), 'Large area coverage. Uniform water distribution. Choose rotating for circles or fixed for patterns.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Submersible Water Pumps', 'Water pumps for wells and water tanks', '⬇️', (SELECT id FROM categories WHERE name = 'Irrigation' AND parent_id IS NULL LIMIT 1), 'Lift water from deep wells or tanks. Various sizes from household to agricultural scale. Energy-efficient models available.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Solar Pumps', 'Solar-powered irrigation pumps', '☀️', (SELECT id FROM categories WHERE name = 'Irrigation' AND parent_id IS NULL LIMIT 1), 'Sustainable water pumping. No electricity costs. Perfect for remote areas. Initial investment pays off in fuel savings.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Water Flow Control Valves', 'Water flow control valves', '🚰', (SELECT id FROM categories WHERE name = 'Irrigation' AND parent_id IS NULL LIMIT 1), 'Regulate water flow precisely. Prevent overwatering. Compatible with all irrigation systems. Simple to operate.');

-- ============================================
-- STEP 7: LIVESTOCK & PETS SUBCATEGORIES (5)
-- ============================================

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Poultry Feed', 'Chicken, duck, and bird feed', '🐔', (SELECT id FROM categories WHERE name = 'Livestock & Pets' AND parent_id IS NULL LIMIT 1), 'Complete nutrition for healthy birds. Layers feed, growers feed, and starter feed. Bulk discounts available.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Cattle Feed', 'Specialized feed for cattle', '🐄', (SELECT id FROM categories WHERE name = 'Livestock & Pets' AND parent_id IS NULL LIMIT 1), 'High-protein formulas for dairy and beef cattle. Supplements, hay, and concentrates. Improves milk yield and weight gain.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Veterinary Medicines', 'Animal medicines and treatments', '💊', (SELECT id FROM categories WHERE name = 'Livestock & Pets' AND parent_id IS NULL LIMIT 1), 'Treat common animal health issues. Antibiotics, dewormers, and supplements. Licensed and approved products only.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Livestock Feeders', 'Troughs, feeders, and watering systems', '🍽️', (SELECT id FROM categories WHERE name = 'Livestock & Pets' AND parent_id IS NULL LIMIT 1), 'Durable equipment for efficient feeding. Reduce waste and labor. Easy to clean and maintain.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Animal Housing & Fencing', 'Animal shelter and containment equipment', '🏠', (SELECT id FROM categories WHERE name = 'Livestock & Pets' AND parent_id IS NULL LIMIT 1), 'Build secure, comfortable shelters. Fencing materials and housing solutions. Predator-proof designs available.');

-- ============================================
-- STEP 8: MACHINERY & TOOLS SUBCATEGORIES (5)
-- ============================================

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Agricultural Tractors', 'Small and large agricultural tractors', '🚜', (SELECT id FROM categories WHERE name = 'Machinery & Tools' AND parent_id IS NULL LIMIT 1), 'Essential farm equipment. Various sizes from mini to large tractors. Check horsepower and compatibility with your farm.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Soil Tillers & Rotavators', 'Soil preparation and tilling equipment', '🚜', (SELECT id FROM categories WHERE name = 'Machinery & Tools' AND parent_id IS NULL LIMIT 1), 'Prepare soil for planting. Break up compacted earth. Available in manual, electric, and petrol versions.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Pruning Tools & Shears', 'Shears, saws, and cutting hand tools', '✂️', (SELECT id FROM categories WHERE name = 'Machinery & Tools' AND parent_id IS NULL LIMIT 1), 'Essential cutting tools. Long-life blades that stay sharp. Ergonomic handles for comfort during extended use.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Electric Drills', 'Corded and cordless drills', '🔌', (SELECT id FROM categories WHERE name = 'Machinery & Tools' AND parent_id IS NULL LIMIT 1), 'Powerful drilling and fastening. Cordless models for mobility. Check battery life and warranty.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Engine Oil', 'Various grades of engine oil', '🛢️', (SELECT id FROM categories WHERE name = 'Machinery & Tools' AND parent_id IS NULL LIMIT 1), 'Keep your machinery running. Synthetic and mineral oils. Choose correct grade for your equipment.');

-- ============================================
-- STEP 9: REPAIRS & SERVICES SUBCATEGORIES (4)
-- ============================================

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Tractor Repair Services', 'Tractor repair and maintenance services', '🚜', (SELECT id FROM categories WHERE name = 'Repairs & Services' AND parent_id IS NULL LIMIT 1), 'Keep your tractor running smoothly. Scheduled maintenance and emergency repairs. Experienced technicians.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Garden Machinery Repairs', 'Tiller and cultivator repairs', '⚙️', (SELECT id FROM categories WHERE name = 'Repairs & Services' AND parent_id IS NULL LIMIT 1), 'Repair or service your garden equipment. Quick turnaround. Parts warranty included.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Chainsaw & Saw Repairs', 'Chainsaw and power saw repair services', '⛓️', (SELECT id FROM categories WHERE name = 'Repairs & Services' AND parent_id IS NULL LIMIT 1), 'Restore your cutting tools to working order. Blade sharpening and part replacement available.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Pump & Sprinkler Repairs', 'Water pump and sprinkler system repairs', '⚙️', (SELECT id FROM categories WHERE name = 'Repairs & Services' AND parent_id IS NULL LIMIT 1), 'Fix irrigation issues quickly. Pump cleaning, valve replacement, and system inspection.');

-- ============================================
-- STEP 10: OTHER PRODUCTS SUBCATEGORIES (5)
-- ============================================

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Protective Gloves', 'Gloves, aprons, and protective wear', '🧤', (SELECT id FROM categories WHERE name = 'Other Products' AND parent_id IS NULL LIMIT 1), 'Stay safe while working. Chemical-resistant and durable gloves. Various sizes available.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Safety Goggles & Eyewear', 'Eye protection for farm work', '🥽', (SELECT id FROM categories WHERE name = 'Other Products' AND parent_id IS NULL LIMIT 1), 'Protect your eyes from dust, chemicals, and debris. Anti-fog and UV protection available.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Respiratory Protection Masks', 'Masks and respirators for chemical handling', '😷', (SELECT id FROM categories WHERE name = 'Other Products' AND parent_id IS NULL LIMIT 1), 'Breathe safely around fertilizers and pesticides. NIOSH-certified respirators. Replacement filters available.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Soil Testing Kits', 'Soil testing kits and equipment', '🧪', (SELECT id FROM categories WHERE name = 'Other Products' AND parent_id IS NULL LIMIT 1), 'Know your soil pH, nutrients, and composition. DIY kits or professional lab testing. Recommendations included.');

INSERT INTO categories (name, description, icon, parent_id, helper_text) VALUES
('Harvest Crates', 'Plastic and wooden harvest containers', '🧺', (SELECT id FROM categories WHERE name = 'Other Products' AND parent_id IS NULL LIMIT 1), 'Store and transport your harvest safely. Stackable for efficient storage. Food-grade materials.');

-- ============================================
-- VERIFICATION QUERIES (uncomment to test)
-- ============================================

-- Check total categories count (should be 48)
-- SELECT COUNT(*) as total_categories FROM categories;

-- Check main categories (should be 8)
-- SELECT COUNT(*) as main_categories FROM categories WHERE parent_id IS NULL;

-- Check subcategories (should be 40)
-- SELECT COUNT(*) as subcategories FROM categories WHERE parent_id IS NOT NULL;

-- View full hierarchy tree
-- SELECT 
--   CASE WHEN parent_id IS NULL THEN '📍 MAIN' ELSE '  └─ SUB' END as level,
--   icon,
--   name,
--   helper_text
-- FROM categories
-- ORDER BY CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END, parent_id, name;

-- Get all subcategories for one main category
-- SELECT icon, name, helper_text
-- FROM categories
-- WHERE parent_id = (SELECT id FROM categories WHERE name = 'Seeds & Seedlings' AND parent_id IS NULL)
-- ORDER BY name;

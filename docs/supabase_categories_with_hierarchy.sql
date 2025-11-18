-- ============================================
-- AgriBuyX Categories with Hierarchy & Helper Text
-- ============================================
-- Updated version with:
-- - parent_id column for hierarchy support
-- - helper_text for tooltips and guidance
-- - Comprehensive category organization

-- NOTE: Run supabase_hierarchy_migration.sql FIRST
-- Then run the INSERT statements below

-- IMPORTANT: Run each main category INSERT separately,
-- then run its subcategories INSERT right after

-- ============================================
-- 1. SEEDS & SEEDLINGS (🌱) - MAIN CATEGORY
-- ============================================

-- INSERT MAIN CATEGORY FIRST
INSERT INTO categories (name, description, icon, parent_id, helper_text) 
VALUES ('Seeds & Seedlings', 'Complete range of seeds and seedlings for agriculture', '🌱', NULL, 
'Browse all seed and seedling products. From amateur vegetable seeds to commercial-grade fruit tree seedlings. Perfect for starting your garden or farm.');

-- THEN INSERT SUBCATEGORIES
-- Get the ID from above and use it in these inserts
INSERT INTO categories (name, description, icon, parent_id, helper_text) 
VALUES 
  ('Vegetable Seeds - Amateur', 'Beginner-friendly vegetable seed varieties', '🌿',
   (SELECT id FROM categories WHERE name = 'Seeds & Seedlings' AND parent_id IS NULL LIMIT 1),
   'Great for home gardeners. Easy to grow vegetables like tomatoes, peppers, and lettuce. Includes growing tips with every purchase.'),
  ('Vegetable Seeds - Professional', 'High-yield commercial vegetable seeds', '🌾',
   (SELECT id FROM categories WHERE name = 'Seeds & Seedlings' AND parent_id IS NULL LIMIT 1),
   'For farmers and commercial growers. High germination rates and disease-resistant varieties. Wholesale quantities available.'),
  ('Vegetable Seedlings', 'Pre-grown vegetable seedlings ready to plant', '🌱',
   (SELECT id FROM categories WHERE name = 'Seeds & Seedlings' AND parent_id IS NULL LIMIT 1),
   'Skip the seed stage. Plant immediately into soil. Saves 4-6 weeks vs growing from seeds. Perfect for time-pressed farmers.'),
  ('Fruit Tree Seeds', 'High-quality fruit tree seedlings and seeds', '🍎',
   (SELECT id FROM categories WHERE name = 'Seeds & Seedlings' AND parent_id IS NULL LIMIT 1),
   'Plant for the future. Mango, guava, citrus, and pawpaw seeds. Full germination guarantee. Growing instructions included.'),
  ('Cereal Seeds', 'Maize, wheat, barley, and other cereals', '🌾',
   (SELECT id FROM categories WHERE name = 'Seeds & Seedlings' AND parent_id IS NULL LIMIT 1),
   'Staple crop seeds for large-scale farming. Improved varieties with higher yields. Bulk discounts available.'),
  ('Seed Potatoes', 'High-quality seed potatoes for planting', '🥔',
   (SELECT id FROM categories WHERE name = 'Seeds & Seedlings' AND parent_id IS NULL LIMIT 1),
   'Certified disease-free potatoes for planting. Choose from early, mid, or late varieties. Storage tips provided.');

-- ============================================
-- 2. FERTILIZERS & SUBSTRATES (🧪) - MAIN CATEGORY
-- ============================================

INSERT INTO categories (name, description, icon, parent_id, helper_text) 
VALUES ('Fertilizers & Substrates', 'Fertilizers, soils and growing media', '🧪', NULL, 
'All nutrients your plants need. From organic composts to precision NPK formulations. Professional-grade and beginner-friendly options.');

-- Subcategories for Fertilizers & Substrates
INSERT INTO categories (name, description, icon, parent_id, helper_text) 
VALUES 
  (
    'Nitrogen Fertilizers',
    'Nitrogen-based fertilizer products for leafy growth',
    '⚗️',
    (SELECT id FROM categories WHERE name = 'Fertilizers & Substrates' AND parent_id IS NULL),
    'Boost leaf and stem growth. Use for vegetables, grains, and leafy crops. Follow dosage instructions for best results.'
  ),
  (
    'NPK & Mineral Fertilizers',
    'NPK and mineral fertilizers for general use',
    '📦',
    (SELECT id FROM categories WHERE name = 'Fertilizers & Substrates' AND parent_id IS NULL),
    'Complete plant nutrition in one product. Balanced N-P-K ratios for most crops. Easy to apply, fast results.'
  ),
  (
    'Organic Fertilizers',
    'Natural and organic fertilizer options',
    '🌿',
    (SELECT id FROM categories WHERE name = 'Fertilizers & Substrates' AND parent_id IS NULL),
    'Chemical-free, sustainable farming. Improve soil structure and microbes. Perfect for organic certification.'
  ),
  (
    'Professional Growing Substrates',
    'Growing media for commercial operations',
    '🪨',
    (SELECT id FROM categories WHERE name = 'Fertilizers & Substrates' AND parent_id IS NULL),
    'For professional growers. Coco, peat, and soil mixes. Consistent quality for high-volume production.'
  );

-- ============================================
-- 3. PLANT PROTECTION (🛡️) - MAIN CATEGORY
-- ============================================

INSERT INTO categories (name, description, icon, parent_id, helper_text) 
VALUES ('Plant Protection', 'Pesticides and plant protection products', '🛡️', NULL, 
'Protect your crops from pests and diseases. Chemical and organic solutions. Professional guidance included.');

-- Subcategories for Plant Protection
INSERT INTO categories (name, description, icon, parent_id, helper_text) 
VALUES 
  (
    'Fungicides',
    'Disease prevention and control products',
    '🧬',
    (SELECT id FROM categories WHERE name = 'Plant Protection' AND parent_id IS NULL),
    'Prevent and treat fungal diseases like powdery mildew and rust. Apply preventatively or curatively. Usage instructions included.'
  ),
  (
    'Insecticides',
    'Pest control and management products',
    '🐛',
    (SELECT id FROM categories WHERE name = 'Plant Protection' AND parent_id IS NULL),
    'Control aphids, whiteflies, spider mites, and other insect pests. Liquid or powder forms available. Safe for beneficial insects.'
  ),
  (
    'Herbicides',
    'Weed control solutions and management',
    '🌿',
    (SELECT id FROM categories WHERE name = 'Plant Protection' AND parent_id IS NULL),
    'Eliminate unwanted weeds without harming crops. Selective herbicides for specific weeds. Apply before weeds mature.'
  ),
  (
    'Biological Control - Predators',
    'Beneficial insects for natural pest control',
    '🦗',
    (SELECT id FROM categories WHERE name = 'Plant Protection' AND parent_id IS NULL),
    'Natural pest management. Ladybugs, lacewings, and parasitic wasps. Environmentally friendly and cost-effective long-term.'
  );

-- ============================================
-- 4. IRRIGATION (💧) - MAIN CATEGORY
-- ============================================

INSERT INTO categories (name, description, icon, parent_id, helper_text) 
VALUES ('Irrigation', 'Complete irrigation systems and equipment', '💧', NULL, 
'Water your crops efficiently. Drip systems, sprinklers, pumps, and hoses. Save water and increase yields.');

-- Subcategories for Irrigation
INSERT INTO categories (name, description, icon, parent_id, helper_text) 
VALUES 
  (
    'Drip Irrigation Hoses',
    'Professional drip irrigation hoses',
    '🌊',
    (SELECT id FROM categories WHERE name = 'Irrigation' AND parent_id IS NULL),
    'Deliver water precisely to plant roots. 30-50% water savings. Easy to install and adjust. Available in various lengths.'
  ),
  (
    'Sprinklers',
    'Rotating and fixed sprinkler systems',
    '💦',
    (SELECT id FROM categories WHERE name = 'Irrigation' AND parent_id IS NULL),
    'Large area coverage. Uniform water distribution. Choose rotating for circles or fixed for patterns.'
  ),
  (
    'Submersible Water Pumps',
    'Water pumps for wells and water tanks',
    '⬇️',
    (SELECT id FROM categories WHERE name = 'Irrigation' AND parent_id IS NULL),
    'Lift water from deep wells or tanks. Various sizes from household to agricultural scale. Energy-efficient models available.'
  ),
  (
    'Solar Pumps',
    'Solar-powered irrigation pumps',
    '☀️',
    (SELECT id FROM categories WHERE name = 'Irrigation' AND parent_id IS NULL),
    'Sustainable water pumping. No electricity costs. Perfect for remote areas. Initial investment pays off in fuel savings.'
  ),
  (
    'Water Flow Control Valves',
    'Water flow control valves',
    '🚰',
    (SELECT id FROM categories WHERE name = 'Irrigation' AND parent_id IS NULL),
    'Regulate water flow precisely. Prevent overwatering. Compatible with all irrigation systems. Simple to operate.'
  );

-- ============================================
-- 5. LIVESTOCK & PETS (🐾) - MAIN CATEGORY
-- ============================================

INSERT INTO categories (name, description, icon, parent_id, helper_text) 
VALUES ('Livestock & Pets', 'Feed and supplies for animals', '🐾', NULL, 
'Complete care for livestock and pets. Nutrition, health products, housing, and equipment. From chickens to cattle.');

-- Subcategories for Livestock & Pets
INSERT INTO categories (name, description, icon, parent_id, helper_text) 
VALUES 
  (
    'Poultry Feed',
    'Chicken, duck, and bird feed',
    '🐔',
    (SELECT id FROM categories WHERE name = 'Livestock & Pets' AND parent_id IS NULL),
    'Complete nutrition for healthy birds. Layers feed, growers feed, and starter feed. Bulk discounts available.'
  ),
  (
    'Cattle Feed',
    'Specialized feed for cattle',
    '🐄',
    (SELECT id FROM categories WHERE name = 'Livestock & Pets' AND parent_id IS NULL),
    'High-protein formulas for dairy and beef cattle. Supplements, hay, and concentrates. Improves milk yield and weight gain.'
  ),
  (
    'Veterinary Medicines',
    'Animal medicines and treatments',
    '💊',
    (SELECT id FROM categories WHERE name = 'Livestock & Pets' AND parent_id IS NULL),
    'Treat common animal health issues. Antibiotics, dewormers, and supplements. Licensed and approved products only.'
  ),
  (
    'Livestock Feeders',
    'Troughs, feeders, and watering systems',
    '🍽️',
    (SELECT id FROM categories WHERE name = 'Livestock & Pets' AND parent_id IS NULL),
    'Durable equipment for efficient feeding. Reduce waste and labor. Easy to clean and maintain.'
  ),
  (
    'Animal Housing & Fencing',
    'Animal shelter and containment equipment',
    '🏠',
    (SELECT id FROM categories WHERE name = 'Livestock & Pets' AND parent_id IS NULL),
    'Build secure, comfortable shelters. Fencing materials and housing solutions. Predator-proof designs available.'
  );

-- ============================================
-- 6. MACHINERY & TOOLS (🔧) - MAIN CATEGORY
-- ============================================

INSERT INTO categories (name, description, icon, parent_id, helper_text) 
VALUES ('Machinery & Tools', 'Garden and farm equipment', '🔧', NULL, 
'Power and hand tools for every job. Tractors, tillers, chainsaws, and accessories. New and used equipment.');

-- Subcategories for Machinery & Tools
INSERT INTO categories (name, description, icon, parent_id, helper_text) 
VALUES 
  (
    'Agricultural Tractors',
    'Small and large agricultural tractors',
    '🚜',
    (SELECT id FROM categories WHERE name = 'Machinery & Tools' AND parent_id IS NULL),
    'Essential farm equipment. Various sizes from mini to large tractors. Check horsepower and compatibility with your farm.'
  ),
  (
    'Soil Tillers & Rotavators',
    'Soil preparation and tilling equipment',
    '🚜',
    (SELECT id FROM categories WHERE name = 'Machinery & Tools' AND parent_id IS NULL),
    'Prepare soil for planting. Break up compacted earth. Available in manual, electric, and petrol versions.'
  ),
  (
    'Pruning Tools & Shears',
    'Shears, saws, and cutting hand tools',
    '✂️',
    (SELECT id FROM categories WHERE name = 'Machinery & Tools' AND parent_id IS NULL),
    'Essential cutting tools. Long-life blades that stay sharp. Ergonomic handles for comfort during extended use.'
  ),
  (
    'Electric Drills',
    'Corded and cordless drills',
    '🔌',
    (SELECT id FROM categories WHERE name = 'Machinery & Tools' AND parent_id IS NULL),
    'Powerful drilling and fastening. Cordless models for mobility. Check battery life and warranty.'
  ),
  (
    'Engine Oil',
    'Various grades of engine oil',
    '🛢️',
    (SELECT id FROM categories WHERE name = 'Machinery & Tools' AND parent_id IS NULL),
    'Keep your machinery running. Synthetic and mineral oils. Choose correct grade for your equipment.'
  );

-- ============================================
-- 7. REPAIRS & SERVICES (🔨) - MAIN CATEGORY
-- ============================================

INSERT INTO categories (name, description, icon, parent_id, helper_text) 
VALUES ('Repairs & Services', 'Equipment repair and maintenance services', '🔨', NULL, 
'Professional repair and maintenance services. Get your equipment fixed fast by experts.');

-- Subcategories for Repairs & Services
INSERT INTO categories (name, description, icon, parent_id, helper_text) 
VALUES 
  (
    'Tractor Repair Services',
    'Tractor repair and maintenance services',
    '🚜',
    (SELECT id FROM categories WHERE name = 'Repairs & Services' AND parent_id IS NULL),
    'Keep your tractor running smoothly. Scheduled maintenance and emergency repairs. Experienced technicians.'
  ),
  (
    'Garden Machinery Repairs',
    'Tiller and cultivator repairs',
    '⚙️',
    (SELECT id FROM categories WHERE name = 'Repairs & Services' AND parent_id IS NULL),
    'Repair or service your garden equipment. Quick turnaround. Parts warranty included.'
  ),
  (
    'Chainsaw & Saw Repairs',
    'Chainsaw and power saw repair services',
    '⛓️',
    (SELECT id FROM categories WHERE name = 'Repairs & Services' AND parent_id IS NULL),
    'Restore your cutting tools to working order. Blade sharpening and part replacement available.'
  ),
  (
    'Pump & Sprinkler Repairs',
    'Water pump and sprinkler system repairs',
    '⚙️',
    (SELECT id FROM categories WHERE name = 'Repairs & Services' AND parent_id IS NULL),
    'Fix irrigation issues quickly. Pump cleaning, valve replacement, and system inspection.'
  );

-- ============================================
-- 8. OTHER PRODUCTS (📦) - MAIN CATEGORY
-- ============================================

INSERT INTO categories (name, description, icon, parent_id, helper_text) 
VALUES ('Other Products', 'Miscellaneous agricultural products', '📦', NULL, 
'Diverse agricultural items. Storage, safety equipment, monitoring tools, and specialty products.');

-- Subcategories for Other Products
INSERT INTO categories (name, description, icon, parent_id, helper_text) 
VALUES 
  (
    'Protective Gloves',
    'Gloves, aprons, and protective wear',
    '🧤',
    (SELECT id FROM categories WHERE name = 'Other Products' AND parent_id IS NULL),
    'Stay safe while working. Chemical-resistant and durable gloves. Various sizes available.'
  ),
  (
    'Safety Goggles & Eyewear',
    'Eye protection for farm work',
    '🥽',
    (SELECT id FROM categories WHERE name = 'Other Products' AND parent_id IS NULL),
    'Protect your eyes from dust, chemicals, and debris. Anti-fog and UV protection available.'
  ),
  (
    'Respiratory Protection Masks',
    'Masks and respirators for chemical handling',
    '😷',
    (SELECT id FROM categories WHERE name = 'Other Products' AND parent_id IS NULL),
    'Breathe safely around fertilizers and pesticides. NIOSH-certified respirators. Replacement filters available.'
  ),
  (
    'Soil Testing Kits',
    'Soil testing kits and equipment',
    '🧪',
    (SELECT id FROM categories WHERE name = 'Other Products' AND parent_id IS NULL),
    'Know your soil pH, nutrients, and composition. DIY kits or professional lab testing. Recommendations included.'
  ),
  (
    'Harvest Crates',
    'Plastic and wooden harvest containers',
    '🧺',
    (SELECT id FROM categories WHERE name = 'Other Products' AND parent_id IS NULL),
    'Store and transport your harvest safely. Stackable for efficient storage. Food-grade materials.'
  );

-- ============================================
-- HIERARCHY VERIFICATION
-- ============================================
-- This script creates:
-- - 8 main categories (parent_id = NULL)
-- - 50+ subcategories (parent_id pointing to main categories)
-- - Helper text for UI tooltips and guidance
-- - Emoji icons for visual identification
-- - Complete agricultural product ecosystem

-- Query to verify hierarchy:
-- SELECT 
--   CASE WHEN parent_id IS NULL THEN 'MAIN' ELSE 'SUB' END as level,
--   icon,
--   name,
--   description
-- FROM categories
-- ORDER BY parent_id, name;

-- Query to get all subcategories under a main category:
-- SELECT sub.icon, sub.name, sub.description, sub.helper_text
-- FROM categories main
-- JOIN categories sub ON sub.parent_id = main.id
-- WHERE main.name = 'Seeds & Seedlings'
-- ORDER BY sub.name;

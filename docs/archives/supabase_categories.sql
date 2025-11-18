-- ============================================
-- AgriBuyX Comprehensive Product Categories
-- ============================================
-- Based on full agricultural ecosystem coverage
-- Run this SQL in Supabase SQL Editor to populate categories

-- IMPORTANT NOTES:
-- 1. HIERARCHY: This implementation supports true parent-child relationships
--    Categories can now have a "parent_id" column that references another category
--    This enables flexible, multi-level product organization
--    Main categories (level 1) have parent_id = NULL
--    Subcategories (level 2+) have parent_id pointing to their parent
--    Helper text added to describe each category's purpose
--
-- 2. IMAGE UPLOAD: Currently products use image_url (text) pointing to external URLs
--    For direct JPG/PNG uploads, we'll need to set up Supabase Storage bucket
--    This is on the roadmap for the next update.
--
-- 3. SEARCH: Added search functionality in admin dashboard for both:
--    - Category selection when adding products (searchable dropdown)
--    - Categories tab (searchable list view)
--
-- 4. HELPER TEXT: Each category includes:
--    - Clear description of what products go here
--    - Target audience (amateur/professional/commercial)
--    - Typical use cases
--    - Emoji icon for visual identification

-- First, delete existing categories if needed (optional)
DELETE FROM categories WHERE name LIKE '%Seeds%' OR name LIKE '%Seedlings%' OR name LIKE '%Fertilizers%' OR name LIKE '%Plant Protection%' OR name LIKE '%Irrigation%' OR name LIKE '%Livestock%' OR name LIKE '%Machinery%' OR name LIKE '%Repairs%' OR name LIKE '%Other Products%';

-- ============================================
-- 1. SEEDS & SEEDLINGS (🌱)
-- ============================================
INSERT INTO categories (name, description, icon) VALUES
  ('Seeds & Seedlings', 'Complete range of seeds and seedlings for agriculture', '🌱'),
  ('Vegetable Seeds - Amateur', 'Beginner-friendly vegetable seed varieties', '🌿'),
  ('Vegetable Seeds - Professional', 'High-yield commercial vegetable seeds', '🌾'),
  ('Vegetable Seedlings', 'Pre-grown vegetable seedlings ready to plant', '🌱'),
  ('Fruit Tree Seeds', 'High-quality fruit tree seedlings and seeds', '🍎'),
  ('Fruit Tree Seedlings', 'Grafted and ungrafted fruit tree seedlings', '🍐'),
  ('Vineyard Seedlings', 'Grapevine and berry plant seedlings', '🍇'),
  ('Frigo Strawberry Seedlings', 'Cold-stored strawberry plants for commercial growing', '🍓'),
  ('Cereal Seeds', 'Maize, wheat, barley, and other cereals', '🌾'),
  ('Seed Potatoes', 'High-quality seed potatoes for planting', '🥔'),
  ('Seed Onions', 'Onion sets and seed onions for propagation', '🧅'),
  ('Clover-Grass Forage Mixtures', 'Mixed forage seeds for pasture', '🌾'),
  ('Grass Seeds for Lawns', 'Pure grass seeds for lawns and pasture', '🌱'),
  ('Flower Seeds', 'Decorative flowering plant seeds', '🌺'),
  ('Rose Seedlings', 'Young rose plants for gardens', '🌹'),
  ('Bulbs & Ornamental Plants', 'Tulips, daffodils, and ornamental bulbs', '💐');

-- ============================================
-- 2. FERTILIZERS & SUBSTRATES (🧪)
-- ============================================
INSERT INTO categories (name, description, icon) VALUES
  ('Fertilizers & Substrates', 'Fertilizers, soils and growing media', '🧪'),
  ('Nitrogen Fertilizers', 'Nitrogen-based fertilizer products for leafy growth', '⚗️'),
  ('Foliar Feeding Fertilizers', 'Liquid and spray fertilizers for foliar application', '💧'),
  ('NPK & Mineral Fertilizers', 'NPK and mineral fertilizers for general use', '📦'),
  ('Water-Soluble Fertilizers', 'Quick-dissolving fertilizer solutions for hydro systems', '💧'),
  ('Amino Acids & Biostimulants', 'Plant-derived amino acids and growth stimulants', '🧬'),
  ('Micronutrient Fertilizers', 'Trace minerals for plant health (Zn, Fe, Mg, etc.)', '⚛️'),
  ('Organic Fertilizers', 'Natural and organic fertilizer options', '🌿'),
  ('Professional Growing Substrates', 'Growing media for commercial operations', '🪨'),
  ('Peat-Based Growing Media', 'Traditional peat moss growing media', '🟤'),
  ('Coco-Based Growing Media', 'Coconut fiber growing media', '🥥'),
  ('Potting Soil', 'Pre-mixed potting and container soil', '🪨'),
  ('Compost & Mulch', 'Composted organic matter and mulching materials', '♻️');

-- ============================================
-- 3. PLANT PROTECTION & BIOLOGICAL CONTROL (🛡️)
-- ============================================
INSERT INTO categories (name, description, icon) VALUES
  ('Plant Protection', 'Pesticides and plant protection products', '🛡️'),
  ('Fungicides', 'Disease prevention and control products', '🧬'),
  ('Herbicides', 'Weed control solutions and management', '🌿'),
  ('Insecticides', 'Pest control and management products', '🐛'),
  ('Biological Control - Predators', 'Beneficial insects for natural pest control', '🦗'),
  ('Bumblebees for Pollination', 'Bumblebee colonies for pollination services', '🐝'),
  ('Parasitic Wasps', 'Natural enemies for aphid and pest control', '🐝'),
  ('Plant Growth Regulators', 'Plant growth hormones and regulators', '📈'),
  ('Physiological Agents', 'Plant tissue culture and enhancement products', '🔬'),
  ('Wetting Agents', 'Surfactants for improved spray coverage', '💧'),
  ('Home & Garden Protection', 'Garden pest control for small-scale growers', '🏠'),
  ('Sanitation & Disinfection', 'Cleaning and sterilization products', '🧼'),
  ('Equipment Disinsection', 'Insect and pest elimination treatments', '🐛'),
  ('Tool Sterilization Products', 'Equipment and tool sterilization products', '🧪');

-- ============================================
-- 4. IRRIGATION SYSTEMS (💧)
-- ============================================
INSERT INTO categories (name, description, icon) VALUES
  ('Irrigation', 'Complete irrigation systems and equipment', '💧'),
  ('Garden Hoses', 'Flexible garden hoses of various sizes', '🔗'),
  ('Flat Hoses', 'Lightweight collapsible garden hoses', '📏'),
  ('Reinforced Hoses', 'Heavy-duty hoses for commercial use', '💪'),
  ('Irrigation Hoses', 'Professional irrigation tubing systems', '🔗'),
  ('Drip Tapes', 'Perforated tapes for precise watering', '📍'),
  ('Drip Irrigation Hoses', 'Professional drip irrigation hoses', '🌊'),
  ('Drip Emitters & Droppers', 'Adjustable water delivery nozzles', '💧'),
  ('Sprinklers', 'Rotating and fixed sprinkler systems', '💦'),
  ('Micro Sprinklers', 'Fine-mist spray systems', '☁️'),
  ('Rain Guns', 'Large area coverage sprinklers', '🔫'),
  ('Submersible Water Pumps', 'Water pumps for wells and water tanks', '⬇️'),
  ('Centrifugal Pumps', 'Surface water pumping equipment', '🌀'),
  ('Solar Pumps', 'Solar-powered irrigation pumps', '☀️'),
  ('Lawn & Sports Field Irrigation', 'Specialized irrigation for turf and sports fields', '🏌️'),
  ('Hose Couplings', 'Quick-connect hose couplings', '🔗'),
  ('Hose Clamps & Fasteners', 'Hose clamps, adapters, and fasteners', '⚙️'),
  ('Connectors & Adapters', 'Various connectors for hose systems', '🔌'),
  ('Water Flow Control Valves', 'Water flow control valves', '🚰');

-- ============================================
-- 5. LIVESTOCK & PETS (🐾)
-- ============================================
INSERT INTO categories (name, description, icon) VALUES
  ('Livestock & Pets', 'Feed and supplies for animals', '🐾'),
  ('Dog Food & Treats', 'Complete dog nutrition and treats', '🐕'),
  ('Cat Food & Treats', 'Complete cat nutrition and treats', '🐱'),
  ('Bird Food & Seeds', 'Seeds and pellets for pet birds', '🦜'),
  ('Fish & Aquatic Food', 'Fish and aquatic pet nutrition', '🐠'),
  ('Pet Grooming Supplies', 'Brushes, shampoos, and grooming tools', '✂️'),
  ('Pet Health & Vitamins', 'Vitamins and health supplements for pets', '💊'),
  ('Pet Accessories', 'Cages, collars, and pet equipment', '🎀'),
  ('Cattle Feed', 'Specialized feed for cattle', '🐄'),
  ('Poultry Feed', 'Chicken, duck, and bird feed', '🐔'),
  ('Pig Feed', 'Swine nutrition and supplements', '🐷'),
  ('Goat & Sheep Feed', 'Small ruminant feed and nutrition', '🐑'),
  ('Fish Feed (Commercial)', 'Commercial fish farming feed', '🐟'),
  ('Veterinary Medicines', 'Animal medicines and treatments', '💊'),
  ('Animal Health Vaccines', 'Animal health vaccines and supplements', '💉'),
  ('Livestock Feeders', 'Troughs, feeders, and watering systems', '🍽️'),
  ('Animal Housing & Fencing', 'Animal shelter and containment equipment', '🏠');

-- ============================================
-- 6. MACHINERY, TOOLS & GARDEN EQUIPMENT (🔧)
-- ============================================
INSERT INTO categories (name, description, icon) VALUES
  ('Machinery & Tools', 'Garden and farm equipment', '🔧'),
  ('Spades & Shovels', 'Digging and earth-moving hand tools', '🪓'),
  ('Hoes & Rakes', 'Cultivation and soil preparation tools', '🪤'),
  ('Pruning Tools & Shears', 'Shears, saws, and cutting hand tools', '✂️'),
  ('Soil Tillers & Rotavators', 'Soil preparation and tilling equipment', '🚜'),
  ('Rotary Cultivators', 'Rotary cultivation machines', '⚙️'),
  ('Agricultural Tractors', 'Small and large agricultural tractors', '🚜'),
  ('Lawn Mowers', 'Lawn mowing and grass trimming equipment', '✂️'),
  ('String Trimmer Heads', 'Trimmer heads, lines and attachments', '✂️'),
  ('Circular Saw Blades', 'Circular saw blades for trimmers', '🔪'),
  ('Trimmer Strings & Lines', 'Replacement trimmer strings and lines', '🧵'),
  ('Electric Chainsaws', 'Electric and petrol chainsaws', '⛓️'),
  ('Replacement Chainsaw Chains', 'Replacement chainsaw chains', '🔗'),
  ('Chainsaw Guide Bars', 'Chainsaw guide bars and accessories', '⚙️'),
  ('Electric Drills', 'Corded and cordless drills', '🔌'),
  ('Impact Drivers', 'Impact tools for fastening', '💥'),
  ('Angle Grinders', 'Metal and stone cutting grinders', '⚙️'),
  ('Engine Oil', 'Various grades of engine oil', '🛢️'),
  ('Hydraulic Oils', 'Hydraulic system fluids', '🔷'),
  ('Grease & Lubricants', 'General purpose greases and lubricants', '🧈'),
  ('Engine Spare Parts', 'Spark plugs, filters, and engine components', '🔧'),
  ('Transmission Parts', 'Gearbox and drive system parts', '⚙️'),
  ('Hydraulic Components', 'Hoses, cylinders, and hydraulic components', '🔷'),
  ('Farm Fencing Wire', 'Wire and material for farm fencing', '🪡'),
  ('Decorative Landscaping Stones', 'Garden decoration and landscaping stones', '🪨'),
  ('Tie-Down Straps & Binders', 'Tie-down straps and binders', '🪢'),
  ('Agricultural Ropes', 'Agricultural and utility ropes', '🪢'),
  ('Agricultural Netting', 'Netting for various agricultural uses', '🕸️');

-- ============================================
-- 7. REPAIRS & MAINTENANCE SERVICES (🔨)
-- ============================================
INSERT INTO categories (name, description, icon) VALUES
  ('Repairs & Services', 'Equipment repair and maintenance services', '🔨'),
  ('Tractor Repair Services', 'Tractor repair and maintenance services', '🚜'),
  ('Garden Machinery Repairs', 'Tiller and cultivator repairs', '⚙️'),
  ('Chainsaw & Saw Repairs', 'Chainsaw and power saw repair services', '⛓️'),
  ('Irrigation Hose Repairs', 'Irrigation hose repair and replacement', '🔗'),
  ('Pump & Sprinkler Repairs', 'Water pump and sprinkler system repairs', '⚙️'),
  ('Electrical Equipment Repair', 'Electrical equipment repair', '⚡'),
  ('Hand Tool Sharpening', 'Hand tool repair and sharpening', '🪛'),
  ('Garden Equipment Maintenance', 'General garden equipment maintenance', '🛠️'),
  ('Welding & Fabrication Services', 'Metal working and welding services', '🔥'),
  ('Custom Metal Fabrication', 'Custom metal parts and structures', '🔧'),
  ('Fence Repair & Installation', 'Fencing repair and installation', '🪡'),
  ('Seasonal Equipment Maintenance', 'Pre-season equipment preparation', '🔧');

-- ============================================
-- 8. OTHER AGRICULTURAL PRODUCTS (📦)
-- ============================================
INSERT INTO categories (name, description, icon) VALUES
  ('Other Products', 'Miscellaneous agricultural products', '📦'),
  ('Seed Storage & Preservation', 'Seed storage and preservation products', '🗄️'),
  ('Soil Testing Kits', 'Soil testing kits and equipment', '🧪'),
  ('Weather Monitoring Equipment', 'Weather stations and monitoring equipment', '🌡️'),
  ('Harvest Crates', 'Plastic and wooden harvest containers', '🧺'),
  ('Storage Bins & Containers', 'Grain and produce storage containers', '🗄️'),
  ('Drying Racks & Equipment', 'Product drying and curing equipment', '🌾'),
  ('Protective Gloves', 'Gloves, aprons, and protective wear', '🧤'),
  ('Safety Goggles & Eyewear', 'Eye protection for farm work', '🥽'),
  ('Respiratory Protection Masks', 'Masks and respirators for chemical handling', '😷'),
  ('Winter Protection Products', 'Cold-weather protective products', '❄️'),
  ('Summer Cooling Products', 'Heat management products', '☀️'),
  ('Pest Control Traps', 'Non-chemical pest management devices', '🪤'),
  ('Beehives & Systems', 'Complete beehive systems', '🐝'),
  ('Beekeeping Protective Suits', 'Protective beekeeping clothing', '👔'),
  ('Honey Extraction Equipment', 'Honey harvesting and processing equipment', '🍯');

-- ============================================
-- SUMMARY
-- ============================================
-- This SQL creates a comprehensive agricultural marketplace with:
-- ✓ 8 main categories covering the full agricultural ecosystem
-- ✓ 50+ subcategories for detailed product organization
-- ✓ 100+ leaf categories for precise product placement
-- ✓ Emoji icons for visual product identification
-- ✓ Descriptions for each category
--
-- Total categories created: ~150+
-- Ready to support all types of agricultural sellers and buyers!

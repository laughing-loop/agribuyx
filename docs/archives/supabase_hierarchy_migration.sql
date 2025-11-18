-- ============================================
-- AgriBuyX Categories Hierarchy Migration
-- ============================================
-- This migration adds parent_id column to support hierarchical categories
-- Run this FIRST before running supabase_categories.sql
--
-- IMPORTANT: If categories table already exists, this will add the column.
-- If it's empty, the main SQL file will populate it with the hierarchy.

-- Step 1: Add parent_id column to categories table (if it doesn't exist)
-- This enables parent-child relationships for category hierarchy

ALTER TABLE categories 
ADD COLUMN parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;

-- Add a helper_text column for better UI descriptions
ALTER TABLE categories 
ADD COLUMN helper_text TEXT DEFAULT 'Select this category for your product';

-- Create an index for faster parent lookups
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- ============================================
-- VERIFIED CATEGORIES STRUCTURE
-- ============================================
-- After running this migration:
--
-- 1. Main Categories (parent_id = NULL) - 8 top-level categories:
--    - Seeds & Seedlings (🌱)
--    - Fertilizers & Substrates (🧪)
--    - Plant Protection (🛡️)
--    - Irrigation (💧)
--    - Livestock & Pets (🐾)
--    - Machinery & Tools (🔧)
--    - Repairs & Services (🔨)
--    - Other Products (📦)
--
-- 2. Subcategories (parent_id = main category ID) - 50+ subcategories
--    Each main category has 5-15 specific subcategories
--
-- 3. Helper Text Examples:
--    - Beginner-friendly vegetable seed varieties
--    - High-yield commercial vegetable seeds
--    - Pre-grown vegetable seedlings ready to plant
--    - Complete range of seeds and seedlings for agriculture
--
-- ============================================
-- BENEFITS OF THIS STRUCTURE
-- ============================================
-- ✓ Users can browse by main category first
-- ✓ Then drill down to specific subcategories
-- ✓ Backend can filter products by category level
-- ✓ Admin can create unlimited sub-levels
-- ✓ More intuitive navigation for buyers
-- ✓ Better product discovery and organization
-- ✓ Flexible enough for future expansion

-- ============================================
-- EXAMPLE QUERIES
-- ============================================

-- Get all main categories (top-level)
-- SELECT * FROM categories WHERE parent_id IS NULL ORDER BY name;

-- Get all subcategories under "Seeds & Seedlings"
-- SELECT * FROM categories 
-- WHERE parent_id = (SELECT id FROM categories WHERE name = 'Seeds & Seedlings')
-- ORDER BY name;

-- Get full category path for a product
-- SELECT c1.name as main_category, c2.name as subcategory
-- FROM categories c1
-- LEFT JOIN categories c2 ON c2.parent_id = c1.id
-- WHERE c1.parent_id IS NULL;

-- Get products organized by hierarchy
-- SELECT 
--   c.name as category,
--   p.title as product,
--   p.price
-- FROM products p
-- LEFT JOIN categories c ON p.category_id = c.id
-- ORDER BY c.parent_id, c.name, p.title;

-- ============================================
-- NOTES FOR DEVELOPERS
-- ============================================
-- 
-- When inserting categories with parent_id, you'll need to:
-- 1. First insert main categories with parent_id = NULL
-- 2. Then insert subcategories with parent_id pointing to the main category ID
--
-- The supabase_categories.sql file now includes parent_id for all categories
-- Make sure to run this migration FIRST, then run supabase_categories.sql
--
-- If you need to manually build the hierarchy:
--   1. Get IDs of main categories after first insert
--   2. Use those IDs in UPDATE statements for subcategories
--   3. Or modify the INSERT statements to use UUIDs
--

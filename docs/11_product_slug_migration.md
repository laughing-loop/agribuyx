# Product Slug Migration

## What This Does

Adds a `slug` column to the `products` table so products get SEO-friendly URLs:
- **Before**: `/products/550e8400-e29b-41d4-a716-446655440000`
- **After**: `/products/bypel-1-organic-biopesticide-550e84`

Old UUID URLs still work — the product detail page (`[id].tsx`) accepts both slugs and UUIDs.

---

## Step 1 — Run SQL Migration in Supabase

Go to your Supabase project → **SQL Editor** → paste and run:

```sql
-- 1. Add slug column (nullable, TEXT)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Create a unique partial index (allows NULLs, enforces uniqueness when set)
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique
  ON products(slug)
  WHERE slug IS NOT NULL;
```

> **This is safe to run on a live database.** The column is nullable — existing products won't break.

---

## Step 2 — Backfill Existing Products

After deploying the code update, run this in the Supabase SQL editor to generate slugs for all existing products that don't have one yet:

```sql
UPDATE products
SET slug = lower(
    regexp_replace(
      regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  ) || '-' || substring(id::text, 1, 6)
WHERE slug IS NULL;
```

This generates slugs like `bypel-1-organic-biopesticide-550e84`.

---

## Step 3 — Verify

After the backfill:
```sql
-- Check all products now have slugs
SELECT COUNT(*) FROM products WHERE slug IS NULL;
-- Should return 0

-- Check for any duplicate slugs (should be 0)
SELECT slug, COUNT(*) FROM products GROUP BY slug HAVING COUNT(*) > 1;
```

---

## How Slug Generation Works (Code)

**On product create** (`dashboard-v2.tsx → handleAddProduct`):
1. Product is inserted without a slug
2. After insert returns the new UUID, a slug is generated: `{title-slug}-{uuid-first-6}`
3. An immediate `UPDATE` sets the slug on that product

**On product edit** (`dashboard-v2.tsx → handleUpdateProduct`):
- If the title hasn't changed → slug is NOT regenerated (preserves existing indexed URLs)
- If the title changed → slug is regenerated with the same UUID suffix

**Slug format**: lowercase, hyphens instead of spaces, special chars stripped, UUID suffix appended for uniqueness.

---

## URL Routing Logic (`[id].tsx`)

```
/products/bypel-1-organic-biopesticide-550e84   → looks up products.slug = 'bypel-...'
/products/550e8400-e29b-41d4-a716-446655440000  → looks up products.id = UUID (UUID regex detection)
```

Both resolve to the same product. Canonical URL in `<head>` always points to the slug URL (if available), preventing duplicate content.

---

## Sitemap Impact

The `/sitemap.xml` route automatically uses slug URLs for any product that has a slug set, and falls back to UUID URLs for products without slugs.

# AgriBuy Lite – Database Schema (Supabase)

This document defines the database tables, fields, constraints, 
and relationships for AgriBuy Lite.

Built for:
- Admin-only uploads
- Optional invite-only vendors
- Public product browsing
- Easy future expansion for AgriBuy Core

All tables use Supabase PostgreSQL.

---

# 3.1 Entity Relationship Diagram (ERD)

admins ─────────┐
▼
products ───────── product_images
▲
└──────── vendors (optional)

categories ─────┘
locations ──────┘
vendor_invites ─┘


---

# 3.2 Tables Overview

| Table Name        | Purpose |
|------------------|---------|
| `admins`         | Platform admins (developers) |
| `vendors`        | Invite-only sellers |
| `vendor_invites` | Stores invitation codes/links |
| `products`       | Main product listings |
| `product_images` | Multiple images per product |
| `categories`     | Product categories |
| `locations`      | Ghana location data (region/district) |

---

# 3.3 Table Definitions

## 3.3.1 `admins`
Stores admin/developer accounts.

| Field | Type | Notes |
|-------|-------|-------|
| id | uuid | PK |
| email | text | unique |
| password_hash | text | hashed |
| fullname | text | optional |
| created_at | timestamp | default now() |

**Notes:**
- Admins have full product control.
- In Phase 1, vendors are optional.

---

## 3.3.2 `vendors` (Optional for Phase 1)
Invite-only vendor accounts.

| Field | Type | Notes |
|-------|-------|-------|
| id | uuid | PK |
| email | text | unique |
| password_hash | text | hashed |
| fullname | text | vendor name |
| phone | text | contact |
| invite_id | uuid | FK to vendor_invites |
| created_at | timestamp | default now() |

---

## 3.3.3 `vendor_invites`
Tracks invitation links for vendors.

| Field | Type | Notes |
|--------|-------|-------|
| id | uuid | PK |
| email | text | email invited |
| code | text | unique invite token |
| is_used | boolean | default false |
| created_at | timestamp | default now() |

---

## 3.3.4 `products`
Central product table.

| Field | Type | Notes |
|--------|-------|---------|
| id | uuid | PK |
| title | text | product title |
| description | text | product details |
| price | numeric | product price |
| category_id | uuid | FK to categories |
| location_id | uuid | FK to locations |
| owner_type | text | 'admin' or 'vendor' |
| owner_id | uuid | FK to admins or vendors |
| whatsapp | text | WhatsApp contact |
| telegram | text | Telegram handle |
| created_at | timestamp | default now() |
| updated_at | timestamp | default now() |

Notes:
- Owner_type + owner_id gives flexible ownership.
- Future version will support full vendor dashboard.

---

## 3.3.5 `product_images`
Stores one or multiple images per product.

| Field | Type | Notes |
|--------|-------|---------|
| id | uuid | PK |
| product_id | uuid | FK to products |
| image_url | text | stored in Supabase |
| thumbnail_url | text | optional |
| created_at | timestamp | default now() |

Notes:
- Supports unlimited images.
- Each image is watermarked before upload.

---

## 3.3.6 `categories`
Predefined product categories.

| Field | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| name | text | e.g. “Maize”, “Cocoa”, “Livestock”, “Seeds” |
| slug | text | unique URL slug |

---

## 3.3.7 `locations`
Stores Ghana regions & districts for product tagging.

| Field | Type | Notes |
|--------|-------|-------|
| id | uuid | PK |
| region | text | e.g. “Greater Accra” |
| district | text | e.g. “Ga South Municipal” |

---

# 3.4 Relationships

- `products.category_id` → `categories.id`
- `products.location_id` → `locations.id`
- `product_images.product_id` → `products.id`
- `vendors.invite_id` → `vendor_invites.id`
- `products.owner_id` → `admins.id` or `vendors.id`

---

# 3.5 Row Level Security (RLS)

### Public Users:
- Can **read** products
- Can **read** categories
- Can **read** locations
- **Cannot** modify any data

### Admins:
- Full CRUD (create, read, update, delete)
- Manage vendors (optional)

### Vendors (Future):
- Can upload/edit **their own** products only

---

# 3.6 Summary

This schema is:

- Lightweight  
- Simple  
- Secure (RLS enforcement)  
- Scalable into full AgriBuy  
- Perfect for admin-only product uploads  
- Flexible for future vendor onboarding  


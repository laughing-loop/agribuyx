# Mobile Marketplace Upgrade — Notes

## Problem: Center-Crop on Product Images

**Before:** Product card images used `object-cover` with a fixed height, causing center-cropping.  
Agricultural products (sprayers, bags, pesticides, fertilizer bottles) are portrait-oriented.
Center-cropping cut off the top and bottom of these images — hiding the product label, cap, nozzle, or bag design.

**After:** All product images use `object-contain` with a neutral `bg-slate-50` background.
The full product is always visible, regardless of image aspect ratio.

---

## Changes Made

### `styles/globals.css`
Added two utility classes:

```css
.product-img-contain {
  background: bg-slate-50;
  object-fit: contain;
}

.product-img-cover {
  object-fit: cover;
}
```

### `pages/products/index.tsx` — Product Cards
```html
<!-- Before (center-crop) -->
<img class="h-36 w-full object-cover" />

<!-- After (full product visible) -->
<div class="aspect-[4/3] flex items-center justify-center bg-slate-50 p-1">
  <img class="h-full w-full object-contain" />
</div>
```

### `pages/products/[id].tsx` — Product Hero & Thumbnails
```html
<!-- Before -->
<div class="h-80 w-full"><img class="h-full w-full object-cover" /></div>

<!-- After -->
<div class="aspect-[4/3] flex items-center justify-center bg-slate-50 p-2">
  <img class="h-full w-full object-contain" />
</div>
```

### `pages/categories/[slug].tsx` — Category Product Grid
Consistent with above — `aspect-[4/3]` container + `object-contain`.

---

## Mobile UI Improvements

| Area | Change |
|---|---|
| Category filter chips | Changed from sidebar list to horizontal scrolling chips on mobile |
| Touch targets | All buttons are minimum 44×44px |
| Floating support button | Added fixed bottom-right CTA on mobile only |
| Search bar | Wider on mobile, full width on small screens |
| Load more | Shows remaining count ("Load more (14 remaining)") |
| Product card | Minimum 2-column grid on all screens |
| Breadcrumb | Truncates long product names gracefully |

---

## Cloudinary Note

The `lib/cloudinary.ts` file now exports two image URL helpers:
- `getThumbnailUrl(publicId)` — fill/cover mode (for blog covers, hero images)
- `getProductCardUrl(publicId)` — pad/contain mode (for product cards — prevents crop)

For product cards, pass the Cloudinary public ID to `getProductCardUrl`. For full-URL images stored in Supabase, pass the URL directly — it is returned as-is.

# Quick Reference: Multiple Image URLs

## The New System

### Before (File Upload)
```
Select file → Upload to storage → Single image → Product created
```

### Now (URL-Based)
```
Paste URL 1 → Preview ✓
Paste URL 2 → Preview ✓
Paste URL 3 → Preview ✓
Submit → All saved to product_images table
```

---

## How to Add Images

**Step 1:** Paste image URL in the input box
```
https://example.com/tomato.jpg
```

**Step 2:** Click "+ Add" (or press Enter)
→ Preview appears immediately

**Step 3:** Add more images same way
→ Each shows as thumbnail with preview

**Step 4:** Remove unwanted images
→ Click "Remove" button

**Step 5:** Submit product
→ All images saved to database

---

## Image Preview Live Demo

```
Input Field:  [https://example.com/image.jpg] [+ Add]

Images Added (3):
┌─────────────────────┐
│ Image 1             │
│ [Preview Image]     │  [Remove]
│                     │
└─────────────────────┘

┌─────────────────────┐
│ Image 2             │
│ [Preview Image]     │  [Remove]
│                     │
└─────────────────────┘

┌─────────────────────┐
│ Image 3             │
│ [Preview Image]     │  [Remove]
│                     │
└─────────────────────┘

✓ 3 images added
```

---

## Key Points

✅ **Multiple images** - No limit on number  
✅ **Live preview** - See before saving  
✅ **URL-based** - Paste links directly  
✅ **Auto main image** - First image = primary  
✅ **Easy management** - Add/remove instantly  
✅ **No upload needed** - Just paste URLs  

---

## Testing

### Test 1: Add Single Image
1. Enter: `https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=300`
2. Click "+ Add"
3. See preview
4. Submit product
5. Check product page - image displays ✓

### Test 2: Add Multiple
1. Add 3 different image URLs
2. See all 3 previews
3. Remove middle one (should show 2)
4. Submit
5. Check database - all images saved ✓

### Test 3: Invalid URL
1. Add invalid URL
2. Should show placeholder
3. Can still submit or remove it ✓

---

## Database

**Main product image:**
```
products.image_url = "https://first-image-url.jpg"
```

**All product images:**
```
product_images:
  - id: xxx, product_id: yyy, image_url: "https://image-1.jpg"
  - id: xxx, product_id: yyy, image_url: "https://image-2.jpg"
  - id: xxx, product_id: yyy, image_url: "https://image-3.jpg"
```

**Query all images for a product:**
```sql
SELECT image_url FROM product_images WHERE product_id = 'xxx' ORDER BY created_at;
```

---

## Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| "URL already added" | Check you didn't paste same URL twice |
| Placeholder shows | URL might be invalid, test in browser |
| Can't add > 1 image | Click "+ Add" after each URL |
| Images not showing | Check `product_images` table in Supabase |

---

## Code Snippet: Retrieve All Images

**For product detail page:**
```typescript
const fetchProductImages = async (productId: string) => {
  const { data } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: true })
  
  return data || []
}
```

---

## Next: Image Gallery

To display all images on product detail page:

```typescript
const [images, setImages] = useState<string[]>([])

useEffect(() => {
  const imgs = await fetchProductImages(productId)
  setImages(imgs.map(img => img.image_url))
}, [productId])

return (
  <div>
    {/* Main image */}
    <img src={images[0]} alt="Main" />
    
    {/* Thumbnails */}
    <div className="flex gap-2 mt-4">
      {images.map((img, idx) => (
        <img 
          key={idx} 
          src={img} 
          alt="Thumb" 
          className="h-12 w-12 cursor-pointer"
          onClick={() => setSelectedImage(img)}
        />
      ))}
    </div>
  </div>
)
```


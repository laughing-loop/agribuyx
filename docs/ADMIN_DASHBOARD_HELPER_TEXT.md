<!-- filepath: docs/ADMIN_DASHBOARD_HELPER_TEXT.md -->

# AgriBuyX Admin Dashboard - Helper Text & Field Guide

This guide explains each field in the product upload form to help admins create better listings.

---

## Form Section 1: Basic Product Info

### 🏷️ Product Title *
**What it does:** The main name buyers see in search results and listings

**Helper text:** "Use a clear, descriptive name. Include brand, model, or type. Buyers search for these words."

**Best practices:**
- Include the brand name (e.g., "Caterpillar D6 Bulldozer")
- Add key specifications (e.g., "iPhone 14 Pro 256GB")
- Be specific not generic (e.g., "Fresh Tomatoes from Central Region" instead of just "Tomatoes")
- Maximum 100 characters for clarity
- Avoid ALL CAPS unless necessary

**Good examples:**
- Toyota Vitz 2010 - White - Automatic
- Fresh Organic Tomatoes - 50kg Batch - Central Region
- John Deere Tractor - 35HP - 2015 Model
- Premium Cocoa Beans - Grade A - 25kg Bag

---

### 💰 Price (₦) *
**What it does:** The selling price in Nigerian Naira

**Helper text:** "Enter the selling price in Nigerian Naira (₦). Use competitive pricing for better sales."

**Best practices:**
- Research market rates before pricing
- Consider product condition and age
- Factor in delivery costs if applicable
- Use round numbers when possible (e.g., ₦50,000 instead of ₦49,999)
- Price competitively but fairly

**Tips:**
- Too high = no inquiries
- Too low = buyers suspect quality issues
- Check similar products on the platform
- Update price periodically to stay competitive

---

### 🏘️ Location *
**What it does:** Where the product is physically located

**Helper text:** "Help buyers find nearby products. Include region and city/district."

**Format:**
- Include both Region and City/District
- Examples: "Ashanti Region, Kumasi" or "Lagos State, Ikeja"

**Why it matters:**
- Buyers prioritize local products to save shipping costs
- Enables location-based product search
- Shows product availability by region

---

### 📱 Contact Phone (Optional)
**What it does:** Direct phone number for buyer inquiries

**Helper text:** "Include country code. Buyers will use this to reach you directly."

**Format:**
- International format: +234 801 234 5678
- Or local format: 0801 234 5678
- WhatsApp number preferred if available

---

## Form Section 2: Product Details

### 📂 Category *
**What it does:** Organizes products by type for easier browsing

**Helper text:** "Showing X categories. Choose the most relevant one for better product visibility."

**Search tips:**
- Search by keyword (e.g., "Drip" finds all drip irrigation products)
- Use emoji icons to identify category type
- Main categories are at the top
- Subcategories are indented below

**Categories breakdown:**
- 🌱 Seeds & Seedlings (16 subcategories)
- 🧪 Fertilizers & Substrates (13 subcategories)
- 🛡️ Plant Protection (14 subcategories)
- 💧 Irrigation (19 subcategories)
- 🐾 Livestock & Pets (17 subcategories)
- 🔧 Machinery & Tools (28 subcategories)
- 🔨 Repairs & Services (13 subcategories)
- 📦 Other Products (16 subcategories)

**Why it matters:**
- Wrong category = buyers can't find your product
- Hierarchical structure helps filter results
- More specific = better targeting

---

### 📝 Description *
**What it does:** Detailed product information

**Helper text:** "Use line breaks for readability. Include dimensions, features, quantity, and any defects."

**Must include:**
- Full specifications (dimensions, weight, capacity)
- Condition details (scratches, dents, wear)
- What's included (accessories, extras, packaging)
- Any defects or issues (be honest)
- Quantity available
- Delivery/shipping terms

**Format tips:**
- Use line breaks for easy reading
- Use bullet points (- prefix) for lists
- Avoid all caps
- Be accurate and honest

**Good example:**
```
Toyota Vitz 2010 - White Pearl
- Mileage: 85,000 km
- Transmission: Automatic
- Engine: 1.0L
- Air Conditioning: Fully functional
- Power steering: Yes
- Central locking: Yes
- Condition: Good (minor scratches on passenger door)
- Papers: Complete
- No accidents, well-maintained
- Ready for inspection anytime
```

---

### 🎨 Product Image (Optional)
**What it does:** Visual representation of the product

**Helper text:** "High-quality images get 3x more inquiries. Show the product clearly."

**Best practices:**
- Clear, well-lit photos
- Show front, side, and back views
- Include detail shots of any damage
- Use neutral background
- No filters or heavy editing
- Actual product photo (not stock images)

**What to avoid:**
- Blurry or dark photos
- Extremely zoomed in/out
- Using someone else's photos
- Fake or misleading images

**Status:**  Coming soon - Image upload to Supabase Storage. Currently using placeholder.

---

## Form Section 3: Product Condition & Warranty

### 🔧 Condition (Optional)
**What it does:** Describes the physical state of the product

**Helper text:** "Honest condition descriptions build buyer trust and reduce returns."

**Options:**
- **New** - Never used or opened
- **Like New** - Minimal cosmetic wear
- **Good** - Normal wear, fully functional
- **Fair** - Heavy wear, works fine
- **Needs Repair** - May need fixing

**Why it matters:**
- Sets buyer expectations
- Reduces returns and disputes
- Increases buyer confidence
- Affects pricing

---

### ✅ Warranty (Optional)
**What it does:** Indicates if the product has a manufacturer or seller warranty

**Helper text:** "Warranty boosts buyer confidence. Specify if manufacturer or seller covers it."

**Options:**
- **No Warranty** - No coverage
- **Has Warranty** - Product is covered

**If "Has Warranty" selected:**
- Must specify warranty period (e.g., 1 year, 2 years)
- Include what's covered (parts, labor, accidental damage)

**Examples:**
- "Manufacturer warranty: 1 year, covers defects"
- "Seller warranty: 6 months, returns accepted"
- "No warranty - sold as is"

---

## Form Section 4: Additional Details

### ⚙️ Features/Specifications (Optional)
**What it does:** Lists key features and technical specs

**Helper text:** "Each feature on a new line. Start with - for bullet points. Make it scannable!"

**Format:**
- One feature per line
- Start with hyphen (-) for bullets
- Use simple language
- List most important features first

**Good example:**
```
- 50 kg capacity
- Stainless steel construction
- Solar powered
- 5-year lifespan
- Energy efficient
- Easy maintenance
- Portable design
```

---

## Form Fields Summary

| Field | Required | Type | Hint |
|-------|----------|------|------|
| Product Title | Yes | Text | Be specific and descriptive |
| Price | Yes | Number | Use competitive pricing |
| Location | Yes | Text | Include region and city |
| Contact Phone | No | Tel | Include country code |
| Category | Yes | Select | Choose most relevant |
| Description | Yes | Text | Include specs and condition |
| Image | No | File | High-quality photo |
| Condition | No | Select | Honest assessment |
| Warranty | No | Select | If applicable |
| Features | No | Text | Key specs and features |

---

## Pro Tips for Better Sales

1. ✅ Fill out ALL optional fields - listings are 40% more likely to sell
2. ✅ Use clear, professional language
3. ✅ Be honest about condition - trust is everything
4. ✅ Price competitively - check similar products
5. ✅ Include high-quality images - they matter most
6. ✅ Respond quickly to inquiries
7. ✅ Update prices regularly
8. ✅ Remove sold items promptly

---

## Common Mistakes to Avoid

❌ Vague titles ("Stuff for sale")  
❌ Extremely high prices  
❌ No description of condition  
❌ Using wrong category  
❌ Poor quality photos  
❌ Dishonest listings  
❌ Missing contact information  
❌ Using outdated information  

---

## Getting Help

- Check category descriptions for placement hints
- Look at successful similar listings for ideas
- Use clear, simple language
- When in doubt, provide more details
- Be honest - it always works better long-term

---

**Last updated:** November 2025  
**Version:** 1.0 with Hierarchy Support

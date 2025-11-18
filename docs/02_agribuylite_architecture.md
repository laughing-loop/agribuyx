# AgriBuyX – System Architecture

This document outlines the technical architecture of AgriBuyX.  
The system is designed to be modern, fast to deploy, and fully scalable.  
Built with **Next.js** on **Vercel** for optimal performance and SEO.

---

# 2.1 High-Level Architecture Diagram

            ┌────────────────────────┐
            │     Frontend (UI)      │
            │   Next.js on Vercel    │
            └───────────┬────────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │   API Layer (Backend)  │
            │ Next.js API Routes     │
            │   (Serverless on Vercel) │
            └───────────┬────────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │     Supabase Backend   │
            │ - PostgreSQL Database  │
            │ - Authentication        │
            │ - Storage (Images)      │
            │ - Policies (RLS)        │
            └───────────┬────────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │ Mobile App (Future)    │
            │ React Native / Expo     │
            │ Uses same API + DB      │
            └────────────────────────┘

---

## 2.2 Frontend – Next.js on Vercel
AgriBuyX uses **Next.js 15** hosted on **Vercel** for:

- Product listing pages (fully responsive)
- Product detail pages with image galleries
- Admin dashboard
- Image uploads and watermarking
- Mobile-first design (excellent for iOS & Android)
- Static rendering & server-side rendering
- SEO optimization with meta tags
- Fast CDN delivery worldwide
- Automatic deployments on git push

### Why Next.js?
- **SEO Ready**: Built-in Next/Head for meta tags, Open Graph, structured data
- **Mobile Optimized**: Responsive design, fast loading on 3G/4G
- **Vercel Hosting**: Free tier, auto-scaling, custom domains
- **Developer Experience**: TypeScript, API routes, hot reload
- **Future Proof**: Easy transition to mobile apps via shared API

---

# 2.3 Backend – Vercel Serverless API Routes

Next.js API routes serve as the scalable backend:

### Tech Stack
- **Node.js Runtime** on Vercel
- **TypeScript** for type safety
- **Middleware** for authentication & validation
- **Next.js 15** built-in routing

### API Responsibilities
- Admin authentication & session management
- Vendor invite system
- Product CRUD operations (Create, Read, Update, Delete)
- Image watermarking before storage
- Product search & filters (category, location, price)
- Category management
- Location-based queries
- Rate limiting & abuse prevention

### Main API Endpoints
```
POST   /api/auth/login           → Admin login
GET    /api/auth/check           → Verify session
POST   /api/products/create      → Create product listing
PUT    /api/products/[id]        → Update product
DELETE /api/products/[id]        → Delete product
GET    /api/products             → List all products (with filters)
GET    /api/products/[id]        → Get product details
POST   /api/vendors/invite       → Send vendor invitation
POST   /api/vendors/register     → Register invited vendor
GET    /api/categories           → Get all categories
```

### Benefits
- **No server maintenance**: Vercel handles scaling
- **Pay-as-you-go**: Free tier covers MVP usage
- **Instant deployment**: Push to git = live immediately
- **Built-in database**: Integrates with Supabase

---

# 2.4 Supabase – Database + Storage + Auth

Supabase handles:

### **1. Database (PostgreSQL)**
Tables:
- `products`  
- `categories`  
- `admins`  
- `vendors`  
- `vendor_invites`  
- `locations`  
- `product_images`  

### **2. Authentication**
- Admin accounts  
- Vendor accounts (invite-only)  
- Secure JWT handling  

### **3. Storage**
- Product images  
- Watermarked versions  
- Vendor photos (future)  

### **4. Role-Based Policies**
Using Row Level Security (RLS):
- Only Admins/Vendors can upload  
- Public can only read  
- No unauthorized modifications  

---

# 2.5 Image Processing Pipeline (Watermarking)

### Image Upload Sequence
1. Admin selects images  
2. Image sent to `/api/products/uploadImage`  
3. Backend applies watermark  
4. Stored in Supabase Storage  
5. Database saves the URL  

### Tools:
- `sharp` (Node image processing library)  
- Simple AgriBuy Lite watermark PNG  

---

# 2.6 Deployment Strategy

### Phase 1 Deployment
- **Frontend:** Vercel  
- **API:** Vercel serverless functions  
- **Database:** Supabase  
- **Storage:** Supabase Storage  
- **Auth:** Supabase Auth  

### DNS Setup (when ready)
Example:

---

# 2.7 Scalability and Future-Proofing

AgriBuy Lite easily evolves into the full AgriBuy system:

- Move API to full backend (NestJS or Django)  
- Expand vendor system  
- Add mobile app  
- Add payments & delivery  
- Add farmer analytics  
- Add product boosting options  

---

# 2.8 Summary

AgriBuy Lite adopts a clean, modern architecture:

- Next.js frontend  
- Vercel serverless backend  
- Supabase database + storage + auth  
- Simple, minimal, scalable foundation  

It is optimized for Phase 1 goals:  
**fast, cheap, stable, and ready for future expansion.**

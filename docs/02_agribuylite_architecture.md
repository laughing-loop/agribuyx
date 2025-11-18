# AgriBuy Lite – System Architecture

This document outlines the technical architecture of AgriBuy Lite.  
The system is designed to be lightweight, fast to deploy, low-cost,  
and fully scalable into the future AgriBuy Core platform.

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

# 2.2 Frontend – Next.js on Vercel
AgriBuy Lite uses **Next.js** hosted on **Vercel** for:

- Product listing pages  
- Product detail pages  
- Admin panel UI  
- Image uploads through client UI  
- Static rendering & server-side rendering  
- Fast CDN delivery worldwide  

### Why Next.js?
- Free hosting on Vercel  
- Built-in API routes  
- Blazing fast  
- Great future integration with mobile apps via shared API  

---

# 2.3 Backend – Vercel Serverless API Routes

Next.js API routes serve as the backend:

### API Responsibilities
- Admin authentication  
- Vendor invite system  
- Upload products  
- Watermark images before storing  
- Fetch product lists  
- Fetch product detail  
- Category filters  
- Location filters  

### Serverless Functions Used For:
- `/api/products/create`  
- `/api/products/update`  
- `/api/products/delete`  
- `/api/vendors/invite`  
- `/api/vendors/register`  
- `/api/auth/login`  
- `/api/auth/check`  

### Benefits:
- No server maintenance  
- Auto-scaling  
- Zero cost for low traffic  
- Integrates seamlessly with the frontend  

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

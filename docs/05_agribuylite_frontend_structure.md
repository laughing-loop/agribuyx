5. System Architecture

This section breaks down how AgribuyLite works internally.
It includes request flows, component interaction, and future scalability.

5.1 High-Level Architecture Overview

AgribuyLite follows a 2-layer architecture with Next.js:

Frontend (Next.js)
        |
        |  Internal API Calls
        v
Backend API (Next.js API Routes)
        |
        |  SQL Queries / Storage Calls
        v
Database + Storage (Postgres + Supabase Storage)

5.2 Component Breakdown
1. Frontend

Built with Next.js

- Handles UI rendering (Server-Side and Client-Side)
- Sends API requests to the backend (API Routes)
- Displays product lists, product details, and contact info
- Shows location of Jelou branches (Kasoa & Accra-Newtown)

2. Backend API

- Next.js API Routes

Backend features:

- Authentication
- Product CRUD (admin only)
- Image upload (secure)
- Admin routes protected via JWT or Supabase Auth
- Vendor onboarding (manual link-only mode for now)

3. Database

PostgreSQL tables:

users

products

categories

vendor_requests (future)

upload_logs

branches (Kasoa, Accra-Newtown)

4. Storage

Stores:

Product images

Category thumbnails

Vendor documents (future)

Branch images

5.3 API Flow Diagram
Example: Admin Uploads Product
Admin Panel → Select Images → Submit Form
                  |
                  v
            Next.js Frontend
                  |
                  v
      POST /api/products (JSON + Files)
                  |
                  v
      Backend validates request
                  |
                  |---> Save images to Storage
                  |
                  |---> Insert product record into Postgres
                  |
                  v
              Response (success)

5.4 User Flow Diagram (Public Visitor)
User opens AgribuyLite → Home Page
                |
                v
        Load Categories → Fetch from API
                |
                v
        Click a Product → Display Product Detail
                |
                v
 Contact Seller Button → Opens Contact Info + Map Location

5.5 Vendor Onboarding Flow (Future Upgrade)
Vendor contacts team →
Admin reviews →
Admin generates private vendor sign-up link →
Vendor registers →
Admin approves →
Vendor can upload products


(Disabled in AgribuyLite MVP.)

5.6 Scalability Strategy

AgribuyLite is built to easily upgrade into full AgriBuy:

Replace Supabase/NestJS with microservices (future)

Add vendor dashboards

Add delivery tracking

Add payments

Add full marketplace features

Connect the Lite platform as a separate module within AgriBuy Cloud
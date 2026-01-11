# AgriBuyX - Agricultural Marketplace Platform

Modern agricultural marketplace connecting farmers, vendors, and buyers.

**Live at**: agribuyx.com (coming soon)  
**Repository**: github.com/laughing-loop/agribuyx

---

## 🎯 Project Overview

AgriBuyX is a multi-platform agricultural marketplace built with:
- **Web**: Next.js 15 + TypeScript + Tailwind CSS
- **Mobile**: React Native + Expo (coming after web launch)
- **Backend**: Serverless API on Vercel
- **Database**: Supabase (PostgreSQL)

---

## 🚀 Quick Start

### Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## 📋 Documentation

- [01_agribuylite_overview.md](docs/01_agribuylite_overview.md) - Project overview
- [02_agribuylite_architecture.md](docs/02_agribuylite_architecture.md) - System architecture
- [03_agribuylite_database.md](docs/03_agribuylite_database.md) - Database schema
- [04_agribuylite_api_spec.md](docs/04_agribuylite_api_spec.md) - API specifications
- [05_agribuylite_frontend_structure.md](docs/05_agribuylite_frontend_structure.md) - Frontend structure
- [06_agribuylite_vendor_invitation_flow.md](docs/06_agribuylite_vendor_invitation_flow.md) - Vendor flow
- [07_deployment_guide.md](docs/07_deployment_guide.md) - Vercel deployment guide
- [08_mobile_app_roadmap.md](docs/08_mobile_app_roadmap.md) - React Native mobile app plan

---

## 🔧 Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Cloudinary (Image CDN)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from the dashboard
3. Create an unsigned upload preset:
   - Go to Settings → Upload
   - Scroll to "Upload presets"
   - Click "Add upload preset"
   - Set signing mode to "Unsigned"
   - Name it (e.g., `agribuyx_unsigned`)
   - Save
4. Add credentials to `.env.local`

---

## 📦 Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Hosting**: Vercel
- **Version Control**: Git + GitHub

---

## 🗂️ Project Structure

```
pages/              - Next.js routes
├── index.tsx       - Landing page
├── _app.tsx        - Global layout
└── api/            - Backend endpoints
styles/             - CSS files
public/             - Static assets
docs/               - Documentation
```

---

## 🎯 Development Roadmap

### Phase 1: Web Platform (Current)
- [x] Landing page
- [x] Admin dashboard
- [x] Product listing pages
- [x] Vercel deployment
- [x] Supabase setup

### Phase 2: Mobile App (After Phase 1)
- [ ] React Native setup
- [ ] iOS/Android development
- [ ] App Store deployment

### Phase 3: Advanced Features
- [ ] Payments integration
- [ ] Messaging system
- [ ] Vendor dashboards
- [ ] Analytics

---

## 📱 Mobile App

React Native + Expo mobile app coming after web platform launch.  
See [08_mobile_app_roadmap.md](docs/08_mobile_app_roadmap.md) for detailed mobile development plan.

---

## 🔐 Security

- HTTPS on all domains
- Environment variables for secrets
- Row-Level Security (RLS) on Supabase
- CORS properly configured
- Rate limiting on API endpoints

---

## 📊 Performance

- Next.js automatic optimization
- Image optimization via Next/Image
- CDN caching on Vercel
- Gzip compression enabled
- TypeScript for type safety

---

## 🤝 Contributing

1. Clone repository
2. Create feature branch: `git checkout -b feature/name`
3. Commit changes: `git commit -m "feat: description"`
4. Push: `git push origin feature/name`
5. Create Pull Request

---

## 📞 Support

Check documentation in `/docs` folder for detailed guides.

---

## 📄 License

Private project - AgriBuyX Team



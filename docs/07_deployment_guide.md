# AgriBuyX Deployment Guide

## 🚀 Quick Start - From GitHub to Live (agribuyx.com)

### Prerequisites
- GitHub account (done ✓)
- Vercel account (free at vercel.com)
- Domain: agribuyx.com (ready ✓)

---

## Step 1: Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up / Log in with GitHub
3. Click **"New Project"**
4. Select **"Import Git Repository"**
5. Search for `laughing-loop/agribuyx` and click **Import**

---

## Step 2: Configure Environment Variables

In Vercel Dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

---

## Step 3: Add Custom Domain

1. In Vercel Project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter `agribuyx.com`
4. Follow instructions to add DNS records to your domain registrar

---

## Step 4: Deploy

Once domain is configured:
- Vercel automatically deploys from your `main` branch
- Every git push triggers a new deployment
- Your landing page will be live at **agribuyx.com** ✓

---

## Local Development

### Install & Run
```bash
cd AgriBuyX
npm install
npm run dev
```

Visit `http://localhost:3000`

### Build for Production
```bash
npm run build
npm start
```

---

## Git Workflow

### Make Changes Locally
```bash
git add .
git commit -m "Your message"
git push origin main
```

Vercel automatically deploys after push!

---

## Project Structure

```
AgriBuyX/
├── pages/                 # Next.js pages (routes)
│   ├── index.tsx         # Landing page
│   ├── _app.tsx          # Global layout
│   └── api/              # Backend API routes
├── styles/               # Global CSS
├── public/               # Static files (images, etc)
├── docs/                 # Documentation
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── tailwind.config.js    # Tailwind CSS config
```

---

## Monitoring & Analytics

- **Vercel Dashboard**: Real-time deployments, logs, analytics
- **Next.js Build Logs**: View at Vercel → Deployments
- **Performance**: Vercel automatically optimizes images, caching, etc

---

## Next Steps

1. ✅ GitHub repo created
2. ✅ Local Next.js project built
3. 🔄 **Connect to Vercel** (this guide)
4. 🔄 Add Supabase database
5. Build admin dashboard
6. Build product listing pages
7. Launch full platform


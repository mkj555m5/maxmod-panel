# 🚀 Maxmod Panel

Professional Node.js hosting platform (Railway-style) with owner dashboard, user management, packages (FREE / PRO / BUSINESS / GOD), bilingual Arabic & English support, and domain management.

![maxmod panel](https://img.shields.io/badge/maxmod%20panel-v1.0.0-emerald)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6-indigo)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 🔐 Authentication
- **Owner account** (auto-created on first run): `mkj555m` / `@ROblox2011`
- Session-based auth with HTTP-only cookies (7-day validity)
- Suspend / activate user accounts

### 👑 Owner Dashboard
- Platform resource monitoring (RAM, Disk, CPU) with live updates
- Statistics: total users, active apps, packages count
- Full user management (CRUD, suspend, change package)
- Domain management (Railway auto-domains + custom domains)
- Monitor all apps across the platform

### 📦 Packages
| Package | RAM | Disk | CPU | Apps | Price |
|---------|-----|------|-----|------|-------|
| **FREE** | 512 MB | 1 GB | 25% | 2 | $0 |
| **PRO** | 2 GB | 5 GB | 50% | 10 | $9.99 |
| **BUSINESS** | 8 GB | 20 GB | 75% | 50 | $29.99 |
| **GOD** | ∞ | ∞ | 100% | ∞ | $99.99 |

### 🎯 User Dashboard
- Personal resource usage (RAM, Disk, Apps)
- Create Node.js apps (versions 18.x / 20.x / 21.x / 22.x LTS)
- Start / Stop / Restart / Delete apps
- Hard limits enforced (cannot exceed package RAM/Disk/App count)

### 🌐 Domain Management
- Register custom domains (e.g., `myapp.com`)
- Track Railway auto-domains (`*.up.railway.app`)
- Link domains to specific apps or to the main panel
- Set primary domain
- SSL status tracking (auto-managed by Railway)
- Built-in Railway deployment instructions

### 🌍 Bilingual Support
- 🇸🇦 Arabic (RTL) — default
- 🇬🇧 English (LTR)
- One-click language toggle in the header
- Theme toggle (dark / light)

### 🎨 Design
- Modern glassmorphism UI with emerald/teal/fuchsia gradients
- Framer Motion animations
- Fully responsive (mobile + desktop)
- Custom scrollbar styling
- Animated grid backgrounds and glow effects

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM (SQLite client)
- **State**: Zustand (client) + TanStack Query (server)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Auth**: Custom session-based (HTTP-only cookies)

---

## 📦 Local Development

### Prerequisites
- Node.js 18+ or Bun
- SQLite (file-based, no external DB needed)

### Install & Run

```bash
# Clone the repository
git clone https://github.com/mkj555m5/maxmod-panel.git
cd maxmod-panel

# Install dependencies
bun install
# or: npm install

# Generate Prisma client
bun run db:generate

# Push database schema
bun run db:push

# Start development server
bun run dev
```

The app will be available at `http://localhost:3000`.

### Default Owner Login
- **Username**: `mkj555m`
- **Password**: `@ROblox2011`

> ⚠️ **Security**: Change the owner credentials in `src/lib/auth.ts` (`seedDatabase` function) before deploying to production. Move them to environment variables.

---

## 🚂 Railway Deployment (Port 8080)

### Step 1: Create Railway Project

1. Go to [Railway.app](https://railway.app) and sign in
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your fork of `maxmod-panel`

### Step 2: Configure Environment Variables

In Railway → **Variables** tab, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `file:/data/custom.db` | Use `/data` for persistent volume |
| `PORT` | `8080` | Railway sets this automatically |
| `NODE_ENV` | `production` | |

### Step 3: Attach a Volume (for SQLite persistence)

1. Go to **Settings** → **Volumes**
2. Click **Add Volume**
3. Mount path: `/data`
4. This persists your SQLite database across deploys

### Step 4: Configure Port 8080

Railway auto-detects the port from the `PORT` env variable. Our `railway.json` already sets:

```json
{
  "deploy": {
    "startCommand": "bun run start:railway",
    "healthcheckPath": "/api/health"
  }
}
```

The Next.js standalone server automatically reads `PORT` env and listens on it (defaults to `8080` if not set).

### Step 5: Generate a Domain

1. Go to **Settings** → **Networking**
2. Click **Generate Domain** — Railway gives you a free `*.up.railway.app` subdomain
3. The domain is **automatically routed to port 8080**
4. SSL is auto-provisioned by Railway
5. Visit your domain — the maxmod panel is now live!

### Step 6: Add a Custom Domain (Optional)

1. Go to **Settings** → **Networking** → **Custom Domain**
2. Enter your domain (e.g., `panel.yourdomain.com`)
3. Railway shows you a CNAME target — add it to your DNS provider:
   ```
   CNAME  panel  ->  xxx.railway.app
   ```
4. Wait for DNS to propagate (5-30 minutes)
5. Railway auto-issues an SSL certificate via Let's Encrypt
6. Your custom domain now serves the panel on port 8080

### Step 7: Register the Domain in the Panel

1. Login as owner (`mkj555m` / `@ROblox2011`)
2. Go to **Domains** in the sidebar
3. Click **Create New Domain**
4. Enter the hostname (e.g., `panel.yourdomain.com`)
5. Select type: **Custom Domain** or **Railway Auto Domain**
6. (Optional) Link to an app, or leave as **Panel Main Domain**
7. (Optional) Check **Set as Primary**
8. Click **Create**

The domain now appears in your panel with SSL status and a direct visit link.

---

## 🐳 Docker Deployment

The repo includes a multi-stage `Dockerfile`:

```bash
# Build the image
docker build -t maxmod-panel .

# Run on port 8080
docker run -p 8080:8080 \
  -e DATABASE_URL=file:/data/custom.db \
  -v $(pwd)/data:/data \
  maxmod-panel
```

Visit `http://localhost:8080`.

---

## 📁 Project Structure

```
maxmod-panel/
├── prisma/
│   └── schema.prisma           # Database schema (User, Package, App, Domain, SystemStat)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/            # Login / session
│   │   │   ├── logout/
│   │   │   ├── users/           # User CRUD (owner)
│   │   │   ├── packages/        # Package listing
│   │   │   ├── apps/            # App CRUD with limit checks
│   │   │   ├── domains/         # Domain CRUD
│   │   │   ├── stats/           # Platform + user stats
│   │   │   └── health/          # Healthcheck endpoint
│   │   ├── layout.tsx           # Root layout (RTL/LTR, dark theme)
│   │   ├── page.tsx             # Main page (login or dashboard)
│   │   └── globals.css          # Tailwind + custom styles
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── owner/
│   │   │   ├── OwnerOverview.tsx
│   │   │   ├── UsersManager.tsx
│   │   │   ├── PackagesViewer.tsx
│   │   │   └── DomainsManager.tsx
│   │   ├── user/
│   │   │   └── UserOverview.tsx
│   │   ├── LoginForm.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── AppsManager.tsx
│   │   ├── ResourceGauge.tsx
│   │   └── SettingsPanel.tsx
│   ├── lib/
│   │   ├── auth.ts              # Auth + session + DB seeding
│   │   ├── db.ts                # Prisma client
│   │   ├── i18n.ts              # AR/EN translations
│   │   ├── store.ts             # Zustand store
│   │   └── utils.ts             # Helpers
│   └── hooks/
│       ├── use-translation.ts
│       ├── use-toast.ts
│       └── use-mobile.ts
├── Dockerfile                   # Multi-stage Docker build
├── railway.json                 # Railway config (JSON)
├── railway.toml                 # Railway config (TOML)
├── .env.example                 # Environment template
├── next.config.ts               # Next.js config (standalone output)
├── package.json
└── tsconfig.json
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth` | Login (returns session cookie) | Public |
| `GET` | `/api/auth` | Get current user | Public |
| `POST` | `/api/logout` | Logout | Auth |
| `GET` | `/api/health` | Healthcheck (no auth) | Public |
| `GET` | `/api/stats` | Platform + user stats | Auth |
| `GET` | `/api/users` | List all users | Owner |
| `POST` | `/api/users` | Create user | Owner |
| `PATCH` | `/api/users/[id]` | Update user (package, status, password) | Owner |
| `DELETE` | `/api/users/[id]` | Delete user | Owner |
| `GET` | `/api/packages` | List packages | Auth |
| `GET` | `/api/apps` | List apps (own or all if owner) | Auth |
| `POST` | `/api/apps` | Create app (with limit checks) | Auth |
| `PATCH` | `/api/apps/[id]` | Start / Stop / Restart app | Auth |
| `DELETE` | `/api/apps/[id]` | Delete app | Auth |
| `GET` | `/api/domains` | List domains | Auth |
| `POST` | `/api/domains` | Create domain | Owner |
| `PATCH` | `/api/domains/[id]` | Update domain (primary, status) | Owner |
| `DELETE` | `/api/domains/[id]` | Delete domain | Owner |

---

## 🛡 Security Notes

1. **Change owner credentials** before production deployment
2. **Use environment variables** for sensitive data (currently hardcoded in `seedDatabase`)
3. **Use a real database** (PostgreSQL/MySQL) for production scale — change `provider` in `prisma/schema.prisma`
4. **Enable HTTPS only** in production (Railway does this automatically)
5. **Rotate the GitHub token** if you pushed it accidentally

---

## 📝 License

MIT License — feel free to use, modify, and distribute.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 💬 Support

For questions or issues, open a GitHub issue at [mkj555m5/maxmod-panel](https://github.com/mkj555m5/maxmod-panel/issues).

---

**Built with ❤️ using Next.js 16, TypeScript, and shadcn/ui**

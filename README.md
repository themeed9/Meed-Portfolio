# Meed Portfolio

A production-ready portfolio and CMS built with Next.js (App Router), Neon PostgreSQL, Prisma ORM, Auth.js, and Cloudinary.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Neon PostgreSQL (serverless)
- **ORM:** Prisma v7
- **Auth:** Auth.js / NextAuth v5
- **Forms:** React Hook Form + Zod
- **Image Upload:** Cloudinary
- **Animations:** GSAP + Lenis
- **Deployment:** Vercel

## Setup

### 1. Create a Neon database

Sign up at [neon.tech](https://neon.tech), create a project, and copy the connection string from the dashboard. It looks like:

```
postgresql://meed-portfolio_owner:password@ep-something.us-east-2.aws.neon.tech/meed-portfolio?sslmode=require
```

### 2. Create Cloudinary account (optional)

Sign up at [cloudinary.com](https://cloudinary.com) and get your cloud name, API key, and API secret from the dashboard.

### 3. Configure environment variables

Copy the example env file:

```bash
cp .env.example .env
```

Edit `.env` and set:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Your Neon PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Generate with `openssl rand -base64 32` |
| `ADMIN_EMAIL` | Yes | Admin login email for the seed user |
| `ADMIN_PASSWORD` | Yes | Admin login password for the seed user |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | No* | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No* | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No* | Cloudinary API secret |

\* Cloudinary vars are optional — image upload is only needed for the media library.

### 4. Install dependencies

```bash
npm install
```

### 5. Push the schema to your database

```bash
npx prisma db push
```

### 6. Seed the database

```bash
npx prisma db seed
```

This creates an admin user and sample projects, testimonials, skills, services, and site content.

### 7. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 8. Log in to the admin

Go to [http://localhost:3000/admin/login](http://localhost:3000/admin/login) and sign in with:

- **Email:** `admin@meedport.com`
- **Password:** `Admin123!`

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import in Vercel

Go to [vercel.com/new](https://vercel.com/new) and import your repository.

### 3. Set environment variables in Vercel

Add the same variables from `.env` to your Vercel project dashboard:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `AUTH_SECRET` | Your auth secret |
| `AUTH_URL` | `https://your-domain.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.vercel.app` |
| `ADMIN_EMAIL` | Admin email for seed |
| `ADMIN_PASSWORD` | Admin password for seed |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

### 4. Deploy

Vercel will build and deploy automatically. Post-deployment, run:

```bash
npx prisma db push
npx prisma db seed
```

You can do this via Vercel CLI or the Vercel dashboard's SQL editor.

## Database Models

- **User** — Admin authentication
- **SiteContent** — Editable homepage/site content (JSON)
- **Project** — Portfolio projects with case study support
- **ProjectImage** — Project image gallery
- **CaseStudySection** — Rich content sections per project
- **Skill** — Skills with proficiency levels
- **Service** — Services offered
- **Testimonial** — Client testimonials
- **SocialLink** — Social media links
- **Resume** — Resume file management
- **ContactMessage** — Contact form submissions

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── work/               # Portfolio listing
│   │   └── [slug]/         # Case study detail
│   ├── about/              # About page
│   ├── services/           # Services page
│   ├── resume/             # Resume page
│   ├── contact/            # Contact form
│   ├── admin/              # Admin CMS
│   │   ├── login/          # Admin login
│   │   ├── projects/       # Project CRUD
│   │   ├── content/        # Site content editor
│   │   ├── skills/         # Skills management
│   │   └── testimonials/   # Testimonial management
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── layout/             # Layout components
│   ├── home/               # Homepage sections
│   ├── projects/           # Project components
│   └── admin/              # Admin components
├── lib/                    # Utilities and config
├── prisma/                 # Database schema and seed
└── tokens/                 # Design tokens
```

## NPM Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:migrate` | Run Prisma migrations |

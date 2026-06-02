# Architecture Rules

- App Router with file-based routing under `app/`
- Server components by default; client components only when interactivity is needed (use "use client")
- Data fetching in server components via Prisma; pass data as props to client components
- API routes under `app/api/` follow REST conventions
- Admin routes are protected via NextAuth session check in layout/page
- Database queries use Prisma ORM with the singleton client from `lib/prisma.ts`

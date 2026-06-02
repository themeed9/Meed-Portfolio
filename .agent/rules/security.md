# Security Rules

- All admin routes check session via `auth()` from `lib/auth.ts`
- API mutations validate session before processing
- Form data validated with Zod schemas from `lib/validations.ts`
- No secrets in client-side code; use server components or API routes
- Contact form has server-side rate limiting consideration
- Passwords hashed with bcryptjs (12 rounds)
- JWT strategy for sessions (no database sessions)

# Admin CMS Rules

- All /admin/* routes are protected via auth check in `app/admin/layout.tsx`
- Admin login at /admin/login uses NextAuth credentials provider
- Forms use React Hook Form with Zod validation
- After mutations, call `router.refresh()` to revalidate server data
- Project form auto-generates slug from title
- Content editor accepts raw JSON — validate before saving
- Delete operations require confirmation dialog
- All API routes return JSON responses with proper status codes

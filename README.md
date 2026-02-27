# Notification & Subscriptions Platform Frontend

Production-ready Next.js frontend that communicates only with BFF endpoints.

## Tech

- Next.js App Router
- TypeScript strict mode
- TanStack Query
- Zod runtime DTO validation
- Playwright e2e

## Security

- No tokens in localStorage/sessionStorage
- `credentials: include` on all API requests
- Refresh via `/api/auth/refresh` with httpOnly cookies
- Automatic retry of the original request exactly once after refresh

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run e2e`

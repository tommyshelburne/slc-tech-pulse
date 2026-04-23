# SLC Tech Pulse

React 18 + TypeScript + Vite app. Event aggregation for SLC/Lehi tech scene.

## Stack
- React 19, TypeScript, Vite
- React Router v7 (client-side routing)
- Zustand (global state — no Redux, no Context API)
- TailwindCSS v4 + CSS custom properties (tokens in src/styles/tokens.css via `@theme`)
- Firebase (Firestore for data, Hosting for deployment)
- date-fns (date utils — no moment, no dayjs)
- Vitest + React Testing Library (tests)

## Key conventions
- All components: TypeScript with explicit prop interfaces
- No `any` types
- CSS: Tailwind classes + CSS var references (e.g. `bg-[var(--bg-card)]`)
- State: Zustand stores in src/store/. Never useState for shared data.
- Services: Firestore access only through src/services/. No direct Firestore calls in components.
- Named exports only (no default exports except pages)
- File naming: PascalCase components, camelCase utils/services/stores

## Design system
Colors defined as CSS custom properties in src/styles/tokens.css.
Use var(--token-name) in inline styles or Tailwind arbitrary values.
Primary accent: #6366f1 (indigo). Dark backgrounds. Minimal chrome.

## Data
Firestore collections: events, jobs, companies
Types defined in src/types/
Seed data: scripts/seed.ts (run once to populate Firebase)

## Environment
.env.local holds Firebase config (VITE_FIREBASE_*)
Never commit .env files.

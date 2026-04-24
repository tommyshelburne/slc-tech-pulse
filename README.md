# SLC Tech Pulse

Event, company, and job aggregation for the Salt Lake City / Lehi tech scene.

Live jobs are pulled from Greenhouse, Lever, and Ashby boards and filtered to US-remote + whitelisted tech roles at local companies.

## Stack

- React 19 + TypeScript + Vite
- React Router v7
- Zustand (global state)
- TailwindCSS v4 with CSS custom properties (`src/styles/tokens.css`)
- Firebase (Firestore for data, Hosting for deployment)
- date-fns
- Vitest + React Testing Library

## Quickstart

```bash
npm install
cp .env.local.example .env.local   # fill in VITE_FIREBASE_* values
npm run dev
```

The dev server runs on the port Vite picks (default 5173).

### Firebase admin scripts

Seeding and job aggregation run under a service account. Place admin credentials at `.secrets/firebase-admin.json` (gitignored) before running:

```bash
npm run seed             # one-time: populate Firestore with companies/events
npm run aggregate:jobs   # pull live jobs from ATS boards into Firestore
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run seed` | Seed Firestore with initial data |
| `npm run aggregate:jobs` | Aggregate live jobs from ATS providers |
| `npm run deploy` | Deploy hosting + rules to Firebase |
| `npm run deploy:hosting` | Deploy hosting only |
| `npm run deploy:rules` | Deploy Firestore rules only |

## Structure

```
src/
  components/    Reusable UI
  pages/         Route-level pages (Home, Events, Companies, Jobs, About)
  services/      Firestore access — components never hit Firestore directly
  store/         Zustand stores
  hooks/         Custom React hooks
  styles/        Tokens + global CSS
  types/         Shared TypeScript types
  utils/         Pure helpers
scripts/
  seed.ts            Seed Firestore collections
  aggregate-jobs.ts  Fetch + filter ATS job postings
features/            Gherkin BDD scenarios
```

Firestore collections: `events`, `jobs`, `companies`.

## Conventions

- Explicit prop interfaces on every component; no `any`
- Named exports only (pages may default-export for routing)
- PascalCase for components, camelCase for utils / services / stores
- Styling via Tailwind utilities + `var(--token-name)` for colors
- Shared state lives in Zustand — no Context API, no `useState` for cross-component data
- All Firestore reads/writes go through `src/services/`

## Deployment

Firebase Hosting. `npm run deploy` ships the current build and Firestore rules. Hosting-only and rules-only variants are available via the scripts above.

# SLC Tech Pulse — Full Build Spec
**For:** Memento AI (via Tommy)
**From:** Claw
**Date:** 2026-03-31
**Target:** v1 complete by April 4, 2026

---

## Project Overview

SLC Tech Pulse is a public-facing React+TypeScript web app that aggregates tech events, job opportunities, and company news from the Salt Lake City / Silicon Slopes tech scene. It serves two purposes:

1. **Community tool** — A real, usable resource for SLC/Lehi devs to stay plugged into the local scene
2. **Portfolio piece** — Demonstrates React/TS, async data, state management, routing, filtering, and clean UI design

This spec is written for **Memento AI** session-by-session task execution. Each section maps to a discrete build session. Read the full spec before starting any session — the architecture decisions in early sessions affect later ones.

---

## Tech Stack

```
React 19 + TypeScript (Vite)
React Router v7
Zustand (global state)
TailwindCSS v4 (CSS-first config via @theme — no tailwind.config.js)
Firebase (Firestore + Hosting — free tier)
date-fns (date formatting)
Vitest + React Testing Library (test harness)
```

No backend server. Client reads Firestore directly; writes happen only through an offline seed script using the Firebase Admin SDK. Firebase Hosting serves the static Vite build.

---

## Preflight — Gotcha Research

Before Session 1, pin known landmines to Memento's RAG so later sessions can `search_gotchas` instead of tripping on them.

```
mcp__memento__search_gotchas → check existing coverage
mcp__memento__add_gotcha     → capture missing ones
```

**Landmines to pin (Technology · Pattern · Severity · Mitigation):**
- React 19 · Strict-mode double-invokes effects in dev · Minor · Keep effects idempotent; expect 2x mounts during development only
- React 19 · `forwardRef` deprecated; `ref` is a normal prop on function components · Minor · Don't wrap new components in `forwardRef`
- Tailwind v4 · No `tailwind.config.js` by default; customizations live in CSS via `@theme` · Major · Put token/theme customizations in `tokens.css` under `@theme`, not a JS config
- Tailwind v4 · Uses `@tailwindcss/vite` plugin, not PostCSS · Minor · Register the plugin in `vite.config.ts`; `@import "tailwindcss"` once in `globals.css`
- React Router v7 · Supersedes v6; `BrowserRouter`/`Routes`/`Route` API unchanged, new data-router patterns optional · Minor · Stick to declarative routes for v1
- Firestore · Offline cache enabled by default · Minor · `getDocs` may return stale data; use `getDocsFromServer` when freshness matters
- Firestore · Default-deny rules break prod reads if not deployed · Major · Deploy `firestore.rules` before first prod load
- Vite · Only `VITE_`-prefixed env vars are exposed to the client · Minor · Enforce via typed `import.meta.env`

---

## Design Direction

**Dark, minimal, fast.** Think Linear meets a tech event board.

### Color Tokens (define in `src/styles/tokens.css`)
```css
:root {
  --bg-base:        #0a0a0f;
  --bg-surface:     #111118;
  --bg-elevated:    #18181f;
  --bg-card:        #14141c;
  --border:         #1e1e2a;
  --border-mid:     #2a2a3a;
  --text-primary:   #f0f0f8;
  --text-secondary: #8888a8;
  --text-muted:     #4e4e68;
  --accent:         #6366f1;        /* indigo — SLC Pulse brand color */
  --accent-dim:     rgba(99,102,241,0.12);
  --success:        #22c55e;
  --warning:        #f59e0b;
  --danger:         #ef4444;
  --radius-sm:      5px;
  --radius-md:      8px;
  --radius-lg:      12px;
  --shadow-sm:      0 1px 4px rgba(0,0,0,0.5);
  --shadow-md:      0 4px 20px rgba(0,0,0,0.6);
}

body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-mid); border-radius: 2px; }
```

---

## Project Structure

```
src/
  components/
    layout/
      Header.tsx          — top nav: logo + links + search
      Footer.tsx          — minimal footer
    ui/
      Badge.tsx            — colored pill tags
      Button.tsx           — primary / ghost / outline
      Card.tsx             — reusable surface card
      EmptyState.tsx       — icon + title + subtitle
      Spinner.tsx          — loading spinner
      SearchInput.tsx      — styled search box
    events/
      EventCard.tsx        — event list item
      EventDetail.tsx      — expanded event view
      EventFilters.tsx     — topic/date/company filters
    jobs/
      JobCard.tsx          — job listing item
      JobFilters.tsx       — role/company/type filters
    companies/
      CompanyCard.tsx      — company tile
  pages/
    HomePage.tsx           — landing: featured events + stats
    EventsPage.tsx         — full events list + filters
    EventDetailPage.tsx    — single event detail
    JobsPage.tsx           — job listings + filters
    CompaniesPage.tsx      — company directory
    AboutPage.tsx          — what is SLC Tech Pulse + submit link
  store/
    eventsStore.ts         — Zustand: events state + actions
    jobsStore.ts           — Zustand: jobs state + actions
    companiesStore.ts      — Zustand: companies state + actions
    uiStore.ts             — Zustand: filters, search, loading
  services/
    firebase.ts            — Firebase init + Firestore helpers
    events.service.ts      — fetch/cache events
    jobs.service.ts        — fetch/cache jobs
    companies.service.ts   — fetch/cache companies
  types/
    event.ts
    job.ts
    company.ts
  utils/
    dates.ts               — date formatting helpers
    filters.ts             — filter logic
    urls.ts                — URL generation helpers
  styles/
    tokens.css
    globals.css
  App.tsx                  — router setup
  main.tsx
```

---

## Data Models

### `src/types/event.ts`
```typescript
export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription: string;  // 1–2 sentences for card preview
  date: string;              // ISO 8601: "2026-04-10T18:00:00"
  endDate?: string;
  location: string;          // "Lehi, UT" or "Online" or "Salt Lake City, UT"
  venue?: string;            // "Adobe Building A" etc.
  isOnline: boolean;
  url: string;               // registration/event page
  imageUrl?: string;
  topics: string[];          // ["React", "AI", "Networking", "Startup"]
  company?: string;          // organizing company if applicable
  isFeatured: boolean;
  source: 'meetup' | 'eventbrite' | 'manual' | 'company';
  createdAt: string;
  updatedAt: string;
}
```

### `src/types/job.ts`
```typescript
export interface Job {
  id: string;
  title: string;
  company: string;
  companyId?: string;
  location: string;         // "Lehi, UT" | "Remote" | "Hybrid – SLC"
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  level: 'junior' | 'mid' | 'senior' | 'staff' | 'any';
  salary?: string;          // "80k–110k" or leave empty
  description: string;
  url: string;
  topics: string[];         // ["React", "TypeScript", "Node"]
  postedAt: string;         // ISO date
  expiresAt?: string;
  isHighlighted: boolean;
  source: 'linkedin' | 'indeed' | 'manual' | 'company';
}
```

### `src/types/company.ts`
```typescript
export interface Company {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  website: string;
  location: string;
  size: 'startup' | 'small' | 'mid' | 'large' | 'enterprise';
  topics: string[];         // tech stack / domain tags
  careersUrl?: string;
  linkedinUrl?: string;
  isHiring: boolean;
  isFeatured: boolean;
}
```

---

## Firebase Setup

### `src/services/firebase.ts`
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Tommy fills these in from Firebase console
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

Firestore collections:
- `events` — Event documents
- `jobs` — Job documents
- `companies` — Company documents

### `firestore.rules`
Public read, no client writes. Seed script uses the Admin SDK and bypasses rules.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{doc}    { allow read: if true; allow write: if false; }
    match /jobs/{doc}      { allow read: if true; allow write: if false; }
    match /companies/{doc} { allow read: if true; allow write: if false; }
  }
}
```

Deploy with `firebase deploy --only firestore:rules` before the first prod load.

### Seed Data
Build a `scripts/seed.ts` that populates Firestore with realistic SLC/Lehi tech scene data.

**Runner:** `tsx scripts/seed.ts` (add `tsx` as a devDependency).
**Auth:** Firebase Admin SDK with a service-account JSON. Generate one from the Firebase console (Project Settings → Service Accounts → Generate new private key). Save to `.secrets/firebase-admin.json` (gitignored). Load via `GOOGLE_APPLICATION_CREDENTIALS=.secrets/firebase-admin.json`.
**Idempotency:** Seed writes use `set()` with deterministic IDs (e.g. `slugify(title)`), so re-running the script updates rather than duplicates.
**Why Admin SDK:** Client SDK seeding would require temporarily opening rules — unsafe. Admin SDK bypasses rules server-side.

**Content:**

**10 seed events** (realistic, not generic):
- Silicon Slopes Summit afterparty (April)
- React SLC Meetup (monthly)
- Utah AI/ML Meetup
- Lehi Tech Happy Hour (networking)
- Adobe Tech Talk: GenAI in Creative Suite
- Lucid Hackathon
- BambooHR Engineering Open House
- Domo Developer Day
- Women in Tech Utah — April mixer
- Y Combinator Utah Alumni Mixer

**15 seed jobs** (realistic SLC companies):
- Junior Frontend Engineer @ Lucid (React/TS)
- Full Stack Developer @ BambooHR
- Software Engineer II @ Adobe Lehi
- React Developer @ Domo
- Frontend Engineer @ Podium
- Software Engineer @ Canopy Tax
- Junior Developer @ Entrata
- Full Stack @ Weave
- SWE II @ Divvy (now Bill.com)
- Frontend Intern @ Qualtrics
- Junior Frontend @ MX Technologies
- Software Engineer @ Health Catalyst
- React/Node Developer @ Vivint
- SWE @ Workfront (Adobe)
- Junior SWE @ ClaimLogiq

**12 seed companies** (real Silicon Slopes players):
Lucid, BambooHR, Adobe (Lehi), Domo, Podium, Qualtrics, Weave, Entrata, Divvy, MX Technologies, Health Catalyst, Canopy Tax

---

## Pages & Components

---

### 1. App Shell — `App.tsx` + `Header.tsx`

**Header:**
- Left: "SLC Tech Pulse" wordmark (14px/700, accent colored) + subtitle "Silicon Slopes · Updated daily" (11px muted)
- Center: Nav links — Events | Jobs | Companies | About
- Right: SearchInput (opens global search overlay on focus)
- Sticky top, `--bg-surface` background, bottom border `--border`
- Mobile: hamburger collapses nav (v1 can be desktop-first)

**Router structure:**
```tsx
/              → HomePage
/events        → EventsPage
/events/:id    → EventDetailPage
/jobs          → JobsPage
/companies     → CompaniesPage
/about         → AboutPage
```

---

### 2. Home Page — `pages/HomePage.tsx`

**Sections (top to bottom):**

```
[Hero]
  "What's happening in Silicon Slopes"
  Subtitle: "Events, jobs, and companies from Utah's tech scene"
  Two CTAs: [Browse Events] [View Jobs]
  Background: subtle gradient from --bg-base to --bg-surface

[Stats strip]
  4 cards: Upcoming Events | Open Jobs | Companies | This Week
  Each: large number + label. Accent colored numbers.

[Featured Events — next 4 upcoming]
  Section header: "Upcoming Events" + "View all →" link
  2-column grid of EventCard (compact variant)
  Sorted by date ascending, show only future events

[Latest Jobs — 4 most recent]
  Section header: "Open Positions" + "View all →" link  
  2-column grid of JobCard (compact)

[Featured Companies]
  Section header: "Companies Hiring" + "View all →" link
  3-column grid of CompanyCard (compact)
  Filter to isHiring: true
```

---

### 3. Events Page — `pages/EventsPage.tsx`

**Layout:**
```
[PageHeader: "Events" + count badge + "Suggest an event" button]
[FilterBar: Topic pills | Date range | Online/In-person toggle | Search]
[Event list — full width, stacked EventCards]
[Empty state if no results]
```

**EventCard (full variant):**
```
┌────────────────────────────────────────────┐
│ [Date badge]  Event Title (16px/600)        │
│               Company/Organizer (12px muted)│
│                                             │
│ Short description (13px secondary, 2 lines) │
│                                             │
│ [📍 Location]  [🏷 Topic] [🏷 Topic]  [→ Register] │
└────────────────────────────────────────────┘
```

- Date badge: accent bg, white text, "APR\n10" format, 48x48px
- Location: `--text-muted` 12px with pin icon
- Topic badges: `--accent-dim` bg, `--accent` text
- Register button: outline variant, small, opens event URL in new tab
- Online events: show "🌐 Online" instead of location with distinct color

**Filters:**
- Topics: ["React", "TypeScript", "AI/ML", "Networking", "Startup", "Backend", "DevOps", "Design", "Product"]
- Date: "All" | "This week" | "This month" | "Next month"
- Format: "All" | "In-person" | "Online"
- Search: filters title + description client-side

All filters live in Zustand `uiStore.ts`. URL reflects active filters via search params.

---

### 4. Event Detail Page — `pages/EventDetailPage.tsx`

```
[Back button → /events]
[Hero: full-width image if available, else gradient with topic color]
[Event header: title (24px/700) + date/time + location + Register CTA]
[Two-column layout below fold]
  Left (65%): full description (ReactMarkdown)
  Right (35%): Info card (date, time, venue, organizer, topics)
[Related events: 3 EventCards with same topic]
```

---

### 5. Jobs Page — `pages/JobsPage.tsx`

Similar pattern to Events. Full job listing with filters.

**JobCard (full variant):**
```
┌────────────────────────────────────────────┐
│ [Company Logo/Initial]  Job Title (15px/600)│
│                          Company · Location  │
│                                             │
│ [Type badge] [Level badge] [Salary if avail]│
│                                             │
│ Short description (2 lines)                 │
│                                  [Apply →]  │
└────────────────────────────────────────────┘
```

**Filters:**
- Role type: All | Full-time | Contract | Internship
- Level: All | Junior | Mid | Senior
- Topics: same tag list as events
- Location: All | On-site | Remote | Hybrid
- Search: title + company

---

### 6. Companies Page — `pages/CompaniesPage.tsx`

**Layout:** 3-column card grid (responsive: 2 on tablet, 1 on mobile)

**CompanyCard:**
```
┌────────────────────────────────────────┐
│ [Logo/Initial 48px]  Company Name      │
│                      Size · Location    │
│                                        │
│ Description (2 lines, 12px secondary)  │
│                                        │
│ [React] [TypeScript] [Node]            │
│                      [Hiring ✓] [→]    │
└────────────────────────────────────────┘
```

- "Hiring" badge: success color, only shown if isHiring: true
- Click card → opens company website in new tab

---

### 7. About Page — `pages/AboutPage.tsx`

Simple content page:
- What is SLC Tech Pulse
- How data is sourced (Meetup, Eventbrite, manual curation)
- "Submit an event or job listing" — email link or Google Form embed
- Tech stack credits (built with React, TypeScript, Firebase)
- GitHub link (optional, if Tommy open-sources it)

---

## State Management (Zustand)

### `src/store/eventsStore.ts`
```typescript
interface EventsState {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  getUpcoming: () => Event[];
  getFeatured: () => Event[];
  getById: (id: string) => Event | undefined;
}
```

### `src/store/uiStore.ts`
```typescript
interface UIState {
  // Events filters
  eventTopicFilter: string[];
  eventDateFilter: 'all' | 'week' | 'month' | 'next-month';
  eventFormatFilter: 'all' | 'online' | 'in-person';
  // Jobs filters
  jobTypeFilter: string;
  jobLevelFilter: string;
  jobLocationFilter: string;
  // Global search
  searchQuery: string;
  searchOpen: boolean;
  // Actions
  setEventTopicFilter: (topics: string[]) => void;
  setEventDateFilter: (filter: UIState['eventDateFilter']) => void;
  setSearchQuery: (q: string) => void;
  setSearchOpen: (open: boolean) => void;
  clearFilters: () => void;
}
```

---

## Services

### `src/services/events.service.ts`
```typescript
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from './firebase';
import type { Event } from '../types/event';

export async function fetchEvents(): Promise<Event[]> {
  const q = query(collection(db, 'events'), orderBy('date', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Event));
}

export async function fetchEventById(id: string): Promise<Event | null> {
  // ...
}
```

Same pattern for `jobs.service.ts` and `companies.service.ts`.

---

## Utils

### `src/utils/dates.ts`
```typescript
import { format, isAfter, isBefore, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export function formatEventDate(iso: string): string {
  return format(new Date(iso), 'EEE, MMM d · h:mm a');
}

export function formatDateBadge(iso: string): { month: string; day: string } {
  const d = new Date(iso);
  return { month: format(d, 'MMM').toUpperCase(), day: format(d, 'd') };
}

export function isUpcoming(iso: string): boolean {
  return isAfter(new Date(iso), new Date());
}

export function isThisWeek(iso: string): boolean {
  const d = new Date(iso);
  return isAfter(d, startOfWeek(new Date())) && isBefore(d, endOfWeek(new Date()));
}
// etc.
```

---

## Testing & Quality

### Test harness
- **Runner:** Vitest + React Testing Library + `@testing-library/jest-dom`
- **Config:** `vitest.config.ts` with `jsdom` environment, reusing Vite's tsconfig paths
- **Layout:**
  - `*.test.ts` colocated with files in `src/utils/`, `src/store/`, `src/services/`
  - `*.test.tsx` colocated with components that have non-trivial logic (filters, cards with variants)
  - `features/*.feature` — Gherkin BDD scenarios (documentation + spec; not wired to a runner in v1)

### Coverage targets (pragmatic — not Memento default)
- `src/utils/` — 90% (pure functions)
- `src/store/` — 80% (state transitions)
- `src/services/` — 70% (mock Firestore)
- Components/pages — render smoke tests only, no coverage gate
- Overall target: ~60%. Chasing 95% on a portfolio UI app is waste — the spec explicitly overrides Memento's default coverage rule via its `test-coverage-95` practical exception.

### BDD scenarios (Gherkin)
One `.feature` file per major user-facing behavior. Written *before* the implementing session so intent is pinned.

Required files:
- `features/browse-events.feature` — list, filter by topic/date/format, search
- `features/view-event-detail.feature` — navigate to detail, see related events
- `features/browse-jobs.feature` — list, filter by type/level/location, apply link
- `features/browse-companies.feature` — directory, hiring filter, external link
- `features/home-overview.feature` — stats strip, featured sections

These double as portfolio documentation.

### Accessibility checklist (enforced in Session 9)
- Semantic landmarks: `<header>`, `<main>`, `<nav>`, `<footer>`
- All interactive elements keyboard-reachable; `:focus-visible` ring using `--accent`
- Icon-only buttons carry `aria-label`
- Text contrast ≥ WCAG AA (audit `--text-muted` on `--bg-card` specifically)
- Inputs have `<label>` or `aria-label`
- Route changes update `document.title`

### Performance budget (enforced in Session 9)
- Lighthouse Performance ≥ 90 (desktop, production build)
- Main JS bundle ≤ 200 KB gzipped (`npm run build` output)
- LCP < 2s on simulated 4G
- Hero image lazy-loaded; Firestore reads batched on mount, not per-component

---

## Memento Workflow

### Per-session protocol
1. **Start:** `mcp__memento__start_work_thread` with `{ name: "Session N: <title>", scope: "<1-line scope>" }`
2. **Mid-session:** `search_gotchas` / `search_knowledge` before reaching for new patterns; `add_gotcha` when a new landmine surfaces
3. **End:** `complete_thread_phase` with outcome summary
4. **Commit:** One commit per completed session, Conventional Commits format:
   - `feat(events): add EventsPage with topic/date filters`
   - `feat(home): build HomePage with stats and featured grids`
   - `chore(test): wire Vitest + RTL harness`
   - No auto-commit mid-session — session boundaries are the logical commit units.

### Commit hygiene
- `npm run build` must pass before every commit.
- `npm test` must pass for any area with tests.
- Never commit `.env.local`, `.secrets/`, or `dist/` (add to `.gitignore` in Session 1).

### What Memento tracks for this project
- Work threads → searchable session-by-session log
- Gotchas → captured during preflight + any new hits during build
- Chat sessions → auto-archived via hooks (no action required)
- User preferences → captured as they surface (no action required)

---

## Build Sessions for Memento

Structure each Memento session as one of these discrete units. Each session should:
- Open with `start_work_thread` and (for Sessions 4–8) the relevant `features/*.feature` file written first
- End with a passing build (`npm run build`), passing tests (`npm test` for touched areas), one Conventional Commits commit, and `complete_thread_phase` called

### Session 1: Project Init + Design System
- Vite + React + TS scaffold
- Install dependencies (including `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `tsx`)
- `.gitignore` covers `.env.local`, `.secrets/`, `dist/`, `node_modules/`
- `src/styles/tokens.css` + `src/styles/globals.css` (Tailwind v4 `@theme` block in tokens.css)
- Register `@tailwindcss/vite` in `vite.config.ts`
- Wire Vitest config (`vitest.config.ts`, jsdom env, setup file importing `@testing-library/jest-dom`)
- Build `Badge`, `Button`, `Card`, `Spinner`, `EmptyState`, `SearchInput` components
- Preflight: populate Memento gotchas (see Preflight section)
- **Test:** All components render without error (one smoke test per component); `npm test` green

### Session 2: Firebase + Data Layer
- Create Firebase project + enable Firestore (production mode)
- Download service-account JSON → `.secrets/firebase-admin.json`
- Firebase init + `.env.local` wiring (client `VITE_FIREBASE_*` vars)
- Deploy `firestore.rules` (`firebase deploy --only firestore:rules`)
- Define all three TypeScript interfaces
- Build all three services (events, jobs, companies) with unit tests (mocked Firestore)
- Build Zustand stores with unit tests (state transitions)
- Build `scripts/seed.ts` using Firebase Admin SDK with deterministic IDs
- Run `tsx scripts/seed.ts` with `GOOGLE_APPLICATION_CREDENTIALS` set
- **Test:** `fetchEvents()` returns seeded data; store/service unit tests green

### Session 3: App Shell + Routing
- `App.tsx` with React Router
- `Header.tsx` (logo, nav links, search input)
- `Footer.tsx`
- Page stubs for all 6 routes (just headings, no content)
- **Test:** All routes navigate correctly, no 404s

### Session 4: Home Page
- `HomePage.tsx` complete
- Stats strip (live counts from Firestore)
- Featured events grid (4 upcoming)
- Latest jobs grid (4 most recent)
- Featured companies strip
- **Test:** Page loads with real data from Firebase

### Session 5: Events Page + EventCard
- `EventsPage.tsx` complete
- `EventCard.tsx` (full + compact variants)
- `EventFilters.tsx` (topic pills, date, format toggle)
- Filter logic wired to `uiStore`
- URL search params reflect active filters
- **Test:** Filtering reduces displayed events correctly

### Session 6: Event Detail Page
- `EventDetailPage.tsx` complete
- Dynamic route `/events/:id`
- Fetch single event from Firestore
- Related events section
- **Test:** Navigate to a real event ID, all data displays

### Session 7: Jobs Page
- `JobsPage.tsx` complete
- `JobCard.tsx`
- `JobFilters.tsx`
- **Test:** Filters work, apply links open correctly

### Session 8: Companies Page + About Page
- `CompaniesPage.tsx`
- `CompanyCard.tsx`
- `AboutPage.tsx`
- **Test:** All pages render correctly

### Session 9: Polish + Deploy
- Responsive layout review (mobile-first pass)
- Loading states and error states on all data-fetching components
- Empty states for all filtered views
- Page titles via `document.title` on route change
- **Accessibility pass** (see Accessibility checklist): landmarks, focus rings, aria-labels, contrast audit, label associations
- **Performance budget** (see Performance budget): Lighthouse ≥ 90, JS bundle ≤ 200 KB gzipped
- `npm run build` — zero errors, zero warnings; check bundle size in output
- Run Lighthouse on the preview build; fix regressions
- Deploy to Firebase Hosting (`firebase deploy`)
- **Test:** Live URL loads correctly, all routes work, Lighthouse passes budget

---

## CLAUDE.md (paste into project root before first Memento session)

```markdown
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
```

---

## Notes for Tommy

- **Firebase setup:** Create a new Firebase project at console.firebase.google.com before Session 2. Free Spark plan is enough. Enable Firestore (production mode), set rules to read-only public for now.
- **Session order matters:** Do sessions 1–3 in order. Sessions 4–8 can be done in any order after 3.
- **Domain:** Firebase Hosting gives you a `*.web.app` URL for free. Custom domain can be added later.
- **v2 ideas to park:** Auth (submit events/jobs), user bookmarks, email digest, real Meetup/Eventbrite API integration, dark/light toggle, PWA/mobile.

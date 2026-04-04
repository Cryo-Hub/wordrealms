# WordRealms

Mobile-first word puzzle RPG: swipe letters on a wheel, earn resources, and build an isometric kingdom.

## Tech stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS 4** + **Framer Motion**
- **Zustand** (persisted game/settings state)
- **TanStack Query**
- **Supabase** (optional auth, profiles, leaderboard — works offline/locally without env)
- **RevenueCat** (optional; mock mode without API key)
- **English dictionary**: `an-array-of-english-words` (lazy-loaded chunk)
- **Other languages**: curated word lists in `src/core/game/dictionaries/*.ts`

## Setup

```bash
npm install
cp .env.example .env   # optional: Supabase + RevenueCat
npm run dev
```

### Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_REVENUECAT_API_KEY` | RevenueCat public SDK key |

Without Supabase keys, the app uses **guest mode** (progress in `localStorage` only).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run generate-assets` | PNG icons/splashes via `canvas` → `public/` |

## Supabase

1. Create a project and run `supabase/migrations/001_initial_schema.sql` (or paste into SQL editor).
2. Enable **Anonymous sign-in** and (optional) **Google** OAuth in Authentication settings.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.

## Architecture

- **Screens**: `src/screens/` — loading, auth, onboarding, home, game, world, league, settings, shop.
- **Game logic**: `src/core/game/` — wheel engine (unchanged), `wordValidator`, `dictionaryManager`, `puzzleGenerator`.
- **Stores**: `src/stores/` — resources, game session, world, daily streak, settings, premium.
- **UI**: `src/components/` — LetterWheel (do not break), world, daily puzzle, league, monetization banners.

See inline comments in stores and services for data flow.

## Deployment (Vercel)

1. Connect the Git repo to Vercel.
2. Framework preset: **Vite**.
3. Build command: `npm run build`, output directory: `dist`.
4. Add environment variables in the Vercel dashboard.

## Revenue model (foundation)

- **Premium** (Shop): 2× word rewards when `isPremium` is true (wired; purchase flow mock without RevenueCat key).
- **Rewarded ad** (simulated): bonus resources with cooldown on World screen when broke.

## License

Private project — adjust as needed.

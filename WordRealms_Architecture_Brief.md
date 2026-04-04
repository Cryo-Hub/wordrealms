# WordRealms — Architektur-Brief
> **Version:** 1.0 | **Status:** MVP-Planung | **Zielplattformen:** iOS, Android, Web (PWA)

---

## Inhaltsverzeichnis

1. [Tech Stack Übersicht](#1-tech-stack-übersicht)
2. [Ordnerstruktur](#2-ordnerstruktur)
3. [Komponenten-Übersicht](#3-komponenten-übersicht)
4. [Datenfluss zwischen Komponenten](#4-datenfluss-zwischen-komponenten)
5. [Supabase Tabellen-Übersicht](#5-supabase-tabellen-übersicht)
6. [State Management Ansatz](#6-state-management-ansatz)
7. [Kritische technische Entscheidungen](#7-kritische-technische-entscheidungen)
8. [Phase 1 (MVP) vs. spätere Phasen](#8-phase-1-mvp-vs-spätere-phasen)

---

## 1. Tech Stack Übersicht

| Schicht | Technologie | Zweck |
|---|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS | UI, Game Logic, Animationen |
| App-Wrapper | Capacitor.js v6 | PWA → Native iOS/Android Bridge |
| Backend-as-a-Service | Supabase | Auth, PostgreSQL DB, Realtime, Edge Functions |
| Hosting (Web) | Vercel | PWA-Hosting, CI/CD via GitHub |
| Payments | RevenueCat + Stripe | IAP (iOS/Android) + Web-Subscription |
| Ads | AdMob (Google) | Rewarded Ads für Ingame-Ressourcen |
| Push Notifications | Web Push API + Supabase Edge Functions | Daily Puzzle Reminder, Liga-Events |
| State Management | Zustand + React Query (TanStack) | Client-State + Server-State |
| Animation | Framer Motion | Wheel-Animationen, Gebäude-Baueffekte |

---

## 2. Ordnerstruktur

```
wordrealms/
├── .github/
│   └── workflows/
│       ├── deploy-vercel.yml          # Auto-Deploy auf Vercel bei Push auf main
│       └── supabase-migrations.yml    # DB-Migrations via Supabase CLI
│
├── supabase/
│   ├── migrations/                    # Versionierte SQL-Migrationsdateien
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_league_system.sql
│   │   └── 003_buildings.sql
│   ├── functions/                     # Edge Functions (Deno Runtime)
│   │   ├── daily-puzzle-scheduler/    # Cron: tägliches Puzzle generieren
│   │   │   └── index.ts
│   │   ├── league-reset/              # Cron: wöchentlicher Liga-Reset
│   │   │   └── index.ts
│   │   ├── push-notification/         # Trigger: Push Notification senden
│   │   │   └── index.ts
│   │   ├── validate-word/             # Wort-Validierung server-seitig
│   │   │   └── index.ts
│   │   └── revenuecat-webhook/        # RevenueCat → Supabase Sync
│   │       └── index.ts
│   └── seed.sql                       # Initialdaten (Wörterbuch-Seed, Startgebäude)
│
├── src/
│   ├── main.tsx                       # React Einstiegspunkt
│   ├── App.tsx                        # Router + Provider-Baum
│   │
│   ├── core/                          # Framework-unabhängige Kern-Logik
│   │   ├── game/
│   │   │   ├── wheelEngine.ts         # Buchstaben-Wheel Algorithmus (Wort-Erkennung)
│   │   │   ├── wordValidator.ts       # Client-seitige Vorprüfung
│   │   │   ├── resourceCalculator.ts  # Wort → Gold/Holz/Stein Formel
│   │   │   └── puzzleGenerator.ts     # Lokale Puzzle-Generierung (Fallback)
│   │   ├── world/
│   │   │   ├── buildingConfig.ts      # Gebäude-Definitionen + Kosten
│   │   │   ├── isometricRenderer.ts   # Isometrische Kalkulation (ohne Canvas)
│   │   │   └── worldState.ts          # Welt-Snapshot Typen
│   │   └── league/
│   │       ├── leagueConfig.ts        # Bronze/Silber/Gold/Diamant Schwellenwerte
│   │       └── rankingEngine.ts       # Punkte-Berechnung
│   │
│   ├── components/
│   │   ├── game/                      # Gameplay-Komponenten
│   │   │   ├── LetterWheel/
│   │   │   │   ├── LetterWheel.tsx    # Hauptkomponente (SVG-basiert)
│   │   │   │   ├── WheelLetter.tsx    # Einzelner Buchstabe (Draggable)
│   │   │   │   ├── SwipeTracker.tsx   # Touch/Mouse Event Handler
│   │   │   │   └── WordPreview.tsx    # Aktuell gewischtes Wort anzeigen
│   │   │   ├── WordInput/
│   │   │   │   ├── WordInput.tsx      # Wort-Eingabe & Submit
│   │   │   │   └── FoundWordsList.tsx # Liste bereits gefundener Wörter
│   │   │   └── ResourceBar/
│   │   │       ├── ResourceBar.tsx    # Gold/Holz/Stein Anzeige oben
│   │   │       └── ResourceGain.tsx   # Fly-out Animation bei Gewinn
│   │   │
│   │   ├── world/                     # Isometrische Welt
│   │   │   ├── IsometricWorld/
│   │   │   │   ├── IsometricWorld.tsx # Haupt-Canvas/SVG Container
│   │   │   │   ├── Building.tsx       # Einzelnes Gebäude (Sprite + Status)
│   │   │   │   ├── BuildingSlot.tsx   # Leerer Bauplatz (mit Bauoption)
│   │   │   │   └── ConstructionModal.tsx # Bau-Bestätigung + Kosten
│   │   │   └── WorldMap/
│   │   │       └── WorldMap.tsx       # Scrollbare Welt-Übersicht
│   │   │
│   │   ├── daily/                     # Daily Puzzle Flow
│   │   │   ├── DailyPuzzle.tsx        # Tages-Puzzle Wrapper
│   │   │   ├── StreakDisplay.tsx       # Streak-Counter + Flammen-Animation
│   │   │   └── PuzzleComplete.tsx     # Abschluss-Screen mit Belohnung
│   │   │
│   │   ├── league/                    # Liga-System
│   │   │   ├── LeagueBoard.tsx        # Aktuelle Liga + Rangliste
│   │   │   ├── LeagueCard.tsx         # Einzelner Spieler in Rangliste
│   │   │   ├── PromotionScreen.tsx    # Aufstiegs-Animation
│   │   │   └── LeagueTimer.tsx        # Countdown zum Reset
│   │   │
│   │   ├── monetization/              # Monetarisierungs-UI
│   │   │   ├── ShopModal.tsx          # IAP Shop (Gems, Premium, Booster)
│   │   │   ├── RewardedAdButton.tsx   # "Schau Werbung für +X Ressourcen"
│   │   │   ├── PremiumBanner.tsx      # Soft-Gate für Premium Features
│   │   │   └── PaywallModal.tsx       # Hard-Paywall für bestimmte Features
│   │   │
│   │   └── ui/                        # Generische UI-Bausteine
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── ProgressBar.tsx
│   │       └── Avatar.tsx
│   │
│   ├── screens/                       # Route-Level Screens
│   │   ├── HomeScreen.tsx             # Hub: Daily + Welt + Liga
│   │   ├── GameScreen.tsx             # Aktives Puzzle spielen
│   │   ├── WorldScreen.tsx            # Isometrische Welt erkunden/bauen
│   │   ├── LeagueScreen.tsx           # Rangliste + Liga-Details
│   │   ├── ShopScreen.tsx             # Vollbild-Shop
│   │   ├── ProfileScreen.tsx          # Spielerprofil + Stats
│   │   ├── OnboardingScreen.tsx       # Tutorial (Erststart)
│   │   └── AuthScreen.tsx             # Login / Registrierung
│   │
│   ├── hooks/                         # Custom React Hooks
│   │   ├── useGameSession.ts          # Aktive Spielsitzung (Timer, Score)
│   │   ├── useLetterWheel.ts          # Wheel-Interaktion (Swipe-Logik)
│   │   ├── useResources.ts            # Ressourcen lesen + ausgeben
│   │   ├── useDailyPuzzle.ts          # Tages-Puzzle laden + Status
│   │   ├── useLeague.ts               # Liga-Daten + Rangliste
│   │   ├── useBuildings.ts            # Gebäude-State + Bauen
│   │   ├── useRevenuecat.ts           # Purchase-Flow (IAP)
│   │   ├── useAdMob.ts                # Rewarded Ad (zeigen/Belohnung)
│   │   ├── usePushNotifications.ts    # Push Permission + Token
│   │   └── useAuth.ts                 # Supabase Auth Wrapper
│   │
│   ├── stores/                        # Zustand Stores (Client State)
│   │   ├── gameStore.ts               # Aktive Session (Buchstaben, Wörter, Timer)
│   │   ├── resourceStore.ts           # Gold, Holz, Stein (optimistic updates)
│   │   ├── worldStore.ts              # Gebäude-Positionen + Bau-Queue
│   │   ├── userStore.ts               # Auth-User + Profil-Cache
│   │   └── notificationStore.ts       # Toast-Queue, In-App Notifications
│   │
│   ├── services/                      # API & Externe Services
│   │   ├── supabase/
│   │   │   ├── client.ts              # Supabase Client Singleton
│   │   │   ├── auth.ts                # Auth Helper (signIn, signOut, session)
│   │   │   ├── puzzleService.ts       # Puzzle CRUD
│   │   │   ├── leagueService.ts       # Liga-Daten + Eintragen
│   │   │   ├── buildingService.ts     # Gebäude bauen/upgraden
│   │   │   └── userProfileService.ts  # Profil lesen/schreiben
│   │   ├── revenuecat/
│   │   │   ├── revenuecatClient.ts    # SDK Init + Offering laden
│   │   │   └── purchaseService.ts     # Kauf-Flow + Entitlement-Check
│   │   └── admob/
│   │       ├── admobClient.ts         # AdMob Init (Capacitor Plugin)
│   │       └── rewardedAdService.ts   # Rewarded Ad laden + anzeigen
│   │
│   ├── types/                         # TypeScript Typen & Interfaces
│   │   ├── game.types.ts              # Puzzle, Word, GameSession
│   │   ├── world.types.ts             # Building, Resource, Tile
│   │   ├── league.types.ts            # League, Rank, PlayerScore
│   │   ├── user.types.ts              # UserProfile, Subscription
│   │   └── supabase.types.ts          # Auto-generiert via Supabase CLI
│   │
│   ├── lib/
│   │   ├── utils.ts                   # Allgemeine Hilfsfunktionen
│   │   ├── constants.ts               # Magic Numbers, Konfiguration
│   │   ├── animations.ts              # Framer Motion Varianten
│   │   └── dictionary.ts              # Lokales Wörterbuch (komprimiert, offline)
│   │
│   └── assets/
│       ├── sprites/                   # Gebäude-Sprites (isometrisch, WebP)
│       ├── icons/                     # UI Icons (SVG)
│       ├── sounds/                    # SFX (Word Found, Build, etc.)
│       └── fonts/                     # Custom Fonts
│
├── capacitor/
│   ├── ios/                           # Xcode-Projekt (auto-generiert + angepasst)
│   └── android/                       # Android Studio Projekt (auto-generiert)
│
├── public/
│   ├── manifest.json                  # PWA Manifest
│   ├── sw.js                          # Service Worker (Offline-Support)
│   └── icons/                         # PWA Icons verschiedener Größen
│
├── capacitor.config.ts                # Capacitor Konfiguration
├── tailwind.config.ts                 # Tailwind Design Tokens
├── vite.config.ts                     # Vite Build Config
├── tsconfig.json
└── package.json
```

---

## 3. Komponenten-Übersicht

### 3.1 Game-Komponenten

#### `LetterWheel.tsx`
Das Herzstück des Gameplays. Rendert 7 Buchstaben als SVG-Kreis. Verwaltet Touch- und Mouse-Events für Swipe-Gesten. Kommuniziert mit `useLetterWheel` Hook für Wort-Erkennung und gibt valide Wörter an `useGameSession` weiter.

**Wichtig:** Rein präsentational — keine direkte Supabase-Kommunikation. Alle Game-Logik läuft über Hooks und Stores.

#### `SwipeTracker.tsx`
Eigenständiger Event-Handler für Touch- und Pointer-Events. Normalisiert Browser- und Native-Unterschiede (Capacitor liefert andere Touch-Koordinaten als Desktop). Gibt Buchstaben-Sequenz an `LetterWheel` zurück.

#### `IsometricWorld.tsx`
Rendert die isometrische Welt als positionierte HTML-Div-Elemente mit CSS-Transform (kein Canvas für bessere Performance bei wenigen Gebäuden). Gebäude-Positionen werden aus dem `worldStore` gelesen. Unterstützt Tap-to-Select und Drag-to-Scroll auf Mobile.

#### `RewardedAdButton.tsx`
Wrapper um `useAdMob`. Zeigt Reward-Angebot an, prüft ob Ad geladen ist, blockiert Double-Clicks und schreibt Belohnung nach erfolgreichem Ad-View in den `resourceStore`.

---

### 3.2 Screens

#### `GameScreen.tsx`
Orchestriert aktive Spielsitzung. Hält `LetterWheel`, `WordInput`, `ResourceBar` und `FoundWordsList`. Initiiert Session via `useGameSession`, zeigt `PuzzleComplete` Modal bei Abschluss.

#### `HomeScreen.tsx`
Navigationszentrum. Zeigt Daily-Puzzle-Status, Streak-Anzeige, kurzen Welt-Preview und Liga-Position. Einstieg in alle anderen Screens.

#### `OnboardingScreen.tsx`
Einmaliger Tutorial-Flow beim Erststart. Führt durch Wheel-Mechanik, Ressourcen-System und erstes Gebäude. Wird via `userStore.hasCompletedOnboarding` Flag gesteuert.

---

### 3.3 Services

#### `puzzleService.ts`
Lädt tägliches Puzzle von Supabase, cached es lokal (localStorage + Zustand). Prüft ob User das Puzzle heute bereits gespielt hat. Submitted Ergebnisse (gefundene Wörter, Zeit, Score) an Supabase.

#### `purchaseService.ts`
Abstraktionsschicht über RevenueCat SDK. Unified API für iOS (StoreKit), Android (Google Play Billing) und Web (Stripe). Schreibt Entitlement-Status nach Kauf in `userStore`.

#### `rewardedAdService.ts`
Lädt Rewarded Ad via AdMob Capacitor Plugin vorab (Pre-loading). Exponiert `show()` Methode. Gibt `RewardItem` zurück das in `resourceCalculator.ts` verarbeitet wird.

---

### 3.4 Core-Logik (Framework-unabhängig)

#### `wheelEngine.ts`
Pure TypeScript. Berechnet ob eine Buchstaben-Sequenz (Swipe-Pfad) ein valides Wort ergibt. Prüft: Buchstaben-Adjacency im Wheel, Mindestlänge (3), Duplikat-Erkennung in bereits gefundenen Wörtern.

#### `resourceCalculator.ts`
Formel: `Wortlänge × Multiplikator → Ressourcen`. Kurze Wörter (3-4 Buchstaben) → Gold. Mittlere (5-6) → Holz. Lange (7+) → Stein + Bonus. Multiplikatoren durch aktive Booster aus `userStore`.

#### `buildingConfig.ts`
Statische Konfigurationsdatei. Definiert alle Gebäude: ID, Name, Sprite-Pfad, Ressourcenkosten, Freischaltbedingungen (z.B. "requires: Sawmill Level 1"), passive Boni.

---

## 4. Datenfluss zwischen Komponenten

### 4.1 Gameplay-Flow (Wort gefunden)

```
SwipeTracker
    │ touch events (letter sequence)
    ▼
LetterWheel
    │ calls useLetterWheel(sequence)
    ▼
wheelEngine.ts (pure function)
    │ isValid: boolean
    ▼
useLetterWheel Hook
    │ valid word → submit
    ▼
useGameSession Hook
    │ calls wordValidator (client pre-check)
    │ optimistic update → resourceStore
    ▼
puzzleService.ts
    │ POST to Supabase Edge Function: validate-word
    ▼
Supabase Edge Function (validate-word)
    │ server-side dictionary check
    │ anti-cheat score validation
    │ schreibt in game_sessions Tabelle
    ▼
resourceCalculator.ts
    │ berechnet Ressourcen-Gewinn
    ▼
resourceStore (Zustand)
    │ update
    ▼
ResourceBar + ResourceGain Animation
```

### 4.2 Gebäude bauen

```
BuildingSlot (tap "Bauen")
    │
    ▼
ConstructionModal (zeigt Kosten)
    │ User bestätigt
    ▼
useBuildings Hook
    │ prüft resourceStore: genug Ressourcen?
    │ optimistic update: Gebäude als "in_construction"
    ▼
buildingService.ts
    │ UPDATE buildings Tabelle
    │ UPDATE user_resources Tabelle (Transaktion)
    ▼
Supabase PostgreSQL (RPC Funktion: build_structure)
    │ atomare Transaktion
    ▼
Supabase Realtime (broadcast)
    │
    ▼
worldStore (Zustand) update
    │
    ▼
IsometricWorld re-render (Gebäude erscheint)
```

### 4.3 Daily Puzzle + Streak

```
Supabase Edge Function: daily-puzzle-scheduler (Cron 00:00 UTC)
    │ generiert neues Puzzle, schreibt in daily_puzzles Tabelle
    ▼
Push Notification via Web Push API
    │ sendet an alle Subscriber
    ▼
User öffnet App → HomeScreen
    │
    ▼
useDailyPuzzle Hook
    │ React Query: GET /daily_puzzles?date=today
    ▼
Supabase DB
    │
    ▼
DailyPuzzle Component + StreakDisplay
    │ User spielt Puzzle
    ▼
puzzleService.submitDailyResult()
    │ schreibt in daily_completions Tabelle
    │ Supabase DB Function: update_streak()
    ▼
StreakDisplay (Framer Motion Animation)
```

### 4.4 Auth-Flow

```
AuthScreen (Email/Google/Apple Sign-In)
    │
    ▼
useAuth Hook → supabase.auth.signInWithOAuth()
    │
    ▼
Supabase Auth (JWT)
    │ on success: session in localStorage
    ▼
userStore.setUser()
    │
    ▼
userProfileService.getOrCreateProfile()
    │ erste Anmeldung: legt user_profiles Zeile an
    ▼
React Query Cache warm-up (Puzzle, Ressourcen, Liga)
    │
    ▼
HomeScreen
```

---

## 5. Supabase Tabellen-Übersicht

### `user_profiles`
Erweiterte Nutzerprofile (ergänzt Supabase `auth.users`).

| Feld | Typ | Beschreibung |
|---|---|---|
| id | uuid (FK auth.users) | Primary Key |
| username | text | Anzeigename |
| avatar_url | text | Profilbild-URL |
| current_league | text | bronze / silver / gold / diamond |
| league_points | int | Punkte in aktueller Liga-Woche |
| total_score | int | Lifetime-Score |
| streak_current | int | Aktuelle tägliche Serie |
| streak_best | int | Längste Serie je |
| is_premium | bool | Premium-Abonnement aktiv |
| premium_expires_at | timestamptz | Ablaufdatum Premium |
| push_token | text | Web Push Subscription JSON |
| created_at | timestamptz | — |
| last_active_at | timestamptz | Für Inaktivitäts-Logik |

---

### `user_resources`
Aktuelle Ressourcen des Spielers.

| Feld | Typ | Beschreibung |
|---|---|---|
| user_id | uuid (FK) | Primary Key (1:1 mit user_profiles) |
| gold | int | Aktuelles Gold |
| wood | int | Aktuelles Holz |
| stone | int | Aktueller Stein |
| gems | int | Premium-Währung |
| updated_at | timestamptz | Für Konflikt-Erkennung |

---

### `daily_puzzles`
Täglich generierte Puzzles.

| Feld | Typ | Beschreibung |
|---|---|---|
| id | uuid | Primary Key |
| puzzle_date | date | UNIQUE — ein Puzzle pro Tag |
| letters | text[7] | Die 7 Buchstaben des Wheels |
| center_letter | text | Pflichtbuchstabe (Mittelposition) |
| valid_words | text[] | Alle gültigen Wörter (server-seitig berechnet) |
| bonus_word | text | Bonuswort für Extra-Belohnung |
| difficulty | text | easy / medium / hard |
| created_at | timestamptz | — |

---

### `daily_completions`
Protokolliert Daily-Puzzle-Abschlüsse.

| Feld | Typ | Beschreibung |
|---|---|---|
| id | uuid | Primary Key |
| user_id | uuid (FK) | Spieler |
| puzzle_id | uuid (FK) | Welches Puzzle |
| words_found | text[] | Gefundene Wörter |
| score | int | Punkte dieser Session |
| completion_time_s | int | Benötigte Sekunden |
| completed_at | timestamptz | Zeitstempel |
| streak_at_time | int | Streak-Länge zum Zeitpunkt |

---

### `game_sessions`
Freie Spiel-Sessions (non-daily).

| Feld | Typ | Beschreibung |
|---|---|---|
| id | uuid | Primary Key |
| user_id | uuid (FK) | Spieler |
| puzzle_letters | text[7] | Verwendete Buchstaben |
| words_found | text[] | Gefundene Wörter |
| resources_earned | jsonb | `{gold: X, wood: Y, stone: Z}` |
| score | int | Punkte |
| started_at | timestamptz | — |
| ended_at | timestamptz | — |

---

### `buildings`
Gebaute Gebäude in der Spielerwelt.

| Feld | Typ | Beschreibung |
|---|---|---|
| id | uuid | Primary Key |
| user_id | uuid (FK) | Besitzer |
| building_type | text | Slug aus `buildingConfig.ts` |
| level | int | Ausbaustufe (1-5) |
| position_x | int | Isometrische X-Koordinate |
| position_y | int | Isometrische Y-Koordinate |
| status | text | built / under_construction / upgrading |
| built_at | timestamptz | — |
| upgrade_started_at | timestamptz | Für Timer-basiertes Bauen (Phase 2) |

---

### `league_seasons`
Wöchentliche Liga-Saisons.

| Feld | Typ | Beschreibung |
|---|---|---|
| id | uuid | Primary Key |
| season_number | int | Fortlaufende Nummer |
| starts_at | timestamptz | Montag 00:00 UTC |
| ends_at | timestamptz | Sonntag 23:59 UTC |
| is_active | bool | Aktuelle Saison |

---

### `league_entries`
Spieler-Einträge pro Saison.

| Feld | Typ | Beschreibung |
|---|---|---|
| id | uuid | Primary Key |
| user_id | uuid (FK) | Spieler |
| season_id | uuid (FK) | Saison |
| league_tier | text | bronze / silver / gold / diamond |
| points | int | Wöchentliche Punkte |
| rank_at_end | int | Finale Platzierung (nach Reset) |
| promoted | bool | Aufgestiegen? |
| demoted | bool | Abgestiegen? |

---

### `word_dictionary`
Server-seitiges Wörterbuch für Validierung (DE + EN).

| Feld | Typ | Beschreibung |
|---|---|---|
| word | text | Primary Key |
| language | text | de / en |
| length | int | Wortlänge (für Index) |
| difficulty_score | int | Für Puzzle-Generierung |

---

### `resource_transactions`
Audit-Log aller Ressourcen-Bewegungen (Anti-Cheat, Support).

| Feld | Typ | Beschreibung |
|---|---|---|
| id | uuid | Primary Key |
| user_id | uuid (FK) | Spieler |
| transaction_type | text | word_reward / building_cost / ad_reward / purchase |
| gold_delta | int | Positiv = Gewinn, Negativ = Ausgabe |
| wood_delta | int | — |
| stone_delta | int | — |
| gems_delta | int | — |
| reference_id | uuid | FK auf game_session / building etc. |
| created_at | timestamptz | — |

---

## 6. State Management Ansatz

### Konzept: Zwei-Schicht-Modell

```
┌─────────────────────────────────────────────┐
│          SERVER STATE (React Query)          │
│  Puzzles, Liga-Daten, Gebäude, Profil        │
│  • Caching, Refetching, Background Sync      │
│  • Optimistic Updates für Ressourcen         │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│          CLIENT STATE (Zustand)              │
│  Aktive Spielsession, UI-State, Animationen  │
│  • Kein Async, kein Refetching               │
│  • Ephemeral (wird nicht persistiert)        │
└─────────────────────────────────────────────┘
```

### Zustand Stores (Client State)

#### `gameStore`
Lebt nur während einer aktiven Spielsession.
```typescript
interface GameStore {
  currentLetters: string[]        // Die 7 Wheel-Buchstaben
  currentSwipePath: number[]      // Indices der aktuell gewischten Buchstaben
  foundWords: string[]            // Bereits gefundene Wörter
  sessionScore: number            // Punkte der laufenden Session
  sessionStartTime: number        // Unix Timestamp
  isSubmitting: boolean           // Verhindert Double-Submit
  reset: () => void
}
```

#### `resourceStore`
Optimistische Updates — wird sofort aktualisiert, dann mit Server abgeglichen.
```typescript
interface ResourceStore {
  gold: number
  wood: number
  stone: number
  gems: number
  pendingTransactions: Transaction[]  // Noch nicht vom Server bestätigt
  applyOptimisticUpdate: (delta: ResourceDelta) => void
  rollback: (transactionId: string) => void
}
```

#### `worldStore`
```typescript
interface WorldStore {
  buildings: Building[]
  selectedBuildingSlot: Position | null
  isConstructionModalOpen: boolean
  buildingInProgress: string | null   // building_type das gerade gebaut wird
}
```

#### `userStore`
```typescript
interface UserStore {
  user: SupabaseUser | null
  profile: UserProfile | null
  isPremium: boolean
  hasCompletedOnboarding: boolean
  setUser: (user) => void
  setProfile: (profile) => void
}
```

### React Query (Server State)

| Query Key | Datenquelle | Stale Time | Refetch |
|---|---|---|---|
| `['daily-puzzle', date]` | Supabase | 24h | on-focus |
| `['league', season_id]` | Supabase Realtime | 60s | Realtime-Event |
| `['buildings', user_id]` | Supabase | 5min | on-mutation |
| `['user-profile', user_id]` | Supabase | 10min | on-focus |

### Supabase Realtime
Wird selektiv eingesetzt — nicht für alles. Nur für Liga-Rangliste (damit Positionen live aktualisieren). Ressourcen und Gebäude nutzen stattdessen Mutations + Query Invalidation (weniger WebSocket-Last).

---

## 7. Kritische technische Entscheidungen

### 7.1 SVG statt Canvas für das Letter Wheel

**Entscheidung:** `LetterWheel` als SVG-Element, nicht HTML5 Canvas.

**Begründung:** Canvas erfordert manuelles Hit-Testing und Redraw-Management. SVG-Elemente sind direkt manipulierbar, können mit CSS gestylt werden, und Framer Motion kann sie animieren. Bei 7 Elementen gibt es keinen Performance-Vorteil von Canvas. Barrierefreiheit (ARIA) ist mit SVG einfacher.

---

### 7.2 Isometrische Welt als positionierte HTML-Divs (kein Canvas, kein WebGL)

**Entscheidung:** Gebäude = absolute positionierte `<div>` mit CSS `transform: translate()`.

**Begründung:** Die Welt hat max. 50-100 Gebäude gleichzeitig — keine Szene, die Canvas/WebGL rechtfertigt. HTML+CSS erlaubt native Touch-Events, ist SEO-freundlicher und spart erheblich an Bundle-Größe. Isometrische Koordinaten-Transformation ist triviale Mathematik (2D → Isometrie via Matrix).

---

### 7.3 Server-seitige Wort-Validierung via Edge Function

**Entscheidung:** Client macht Vorprüfung (UX), Server validiert final (Anti-Cheat).

**Begründung:** Clients sind manipulierbar. Ohne Server-Validierung könnten Spieler beliebige Wörter einreichen und Ressourcen generieren. Die Edge Function prüft gegen `word_dictionary` Tabelle und validiert dass die Buchstaben-Kombination aus dem aktuellen Puzzle möglich ist. Latenz ist durch optimistisches Update unsichtbar.

---

### 7.4 RevenueCat als Payment-Abstraktionsschicht

**Entscheidung:** RevenueCat vor direkter Stripe/StoreKit/Play Billing Integration.

**Begründung:** Ohne RevenueCat müssten drei komplett verschiedene Payment-SDKs (Stripe Web, Apple StoreKit, Google Play Billing) implementiert und synchronisiert werden. RevenueCat normalisiert alle drei auf eine API, stellt Entitlement-Management bereit und verhindert dass Premium-Status inkonsistent wird wenn jemand auf einem anderen Gerät kauft.

---

### 7.5 Lokales Wörterbuch + Server-Validierung

**Entscheidung:** Komprimiertes Client-Dictionary (DAWG/Trie-Format, ~500KB) für instant Feedback + Server-Validation.

**Begründung:** Jede Taste ohne lokales Dictionary würde einen Server-Request triggern — bei aktivem Spielen 5-15 Anfragen/Minute. Das lokale Dictionary filtert 95% der Tippfehler sofort ohne Latenz. Nur bei positiver Lokal-Prüfung wird der Server kontaktiert.

---

### 7.6 Capacitor statt React Native

**Entscheidung:** Capacitor.js (PWA → Native Wrapper) statt React Native.

**Begründung:** Das Spiel ist im Kern eine Web-App (React + Tailwind). Capacitor ermöglicht eine einzige Codebasis für Web, iOS und Android. React Native würde einen zweiten Render-Stack erfordern und die CSS-basierten Animationen wären nicht übertragbar. Capacitor-Plugins (AdMob, Push Notifications, Haptics) liefern die nötige Native-Integration.

---

### 7.7 Zustand + React Query statt Redux

**Entscheidung:** Zustand für UI/Game-State, React Query für Server-State.

**Begründung:** Redux für ein Mobile Game wäre massives Over-Engineering. Zustand hat minimales Boilerplate, kein Provider-Wrapping, und funktioniert direkt in Hooks. React Query eliminiert manuelles Caching, Loading-States und Refetch-Logik für Supabase-Daten komplett.

---

### 7.8 Atomare Datenbank-Transaktionen für Ressourcen

**Entscheidung:** Ressourcen-Ausgaben (Gebäude bauen) via Supabase RPC-Funktionen, nicht via separaten Updates.

**Begründung:** Zwei separate `UPDATE`-Statements (Ressourcen abziehen + Gebäude erstellen) können bei Netzwerkunterbrechungen zu inkonsistenten Zuständen führen (Ressourcen weg, Gebäude nicht angelegt). PostgreSQL-Stored-Procedures via `supabase.rpc('build_structure', {...})` sind atomar.

---

## 8. Phase 1 (MVP) vs. spätere Phasen

### Phase 1 — MVP (8-10 Wochen)

**Ziel:** Spielbares Produkt mit Kernschleife und erster Monetarisierung.

#### Gameplay
- Letter Wheel mit 7 Buchstaben (Swipe-Mechanik)
- Wort-Validierung (Client + Server)
- Ressourcen-System: Gold, Holz, Stein
- 3 Daily Puzzles pro Woche (kein täglicher Generator, manuell kuratiert)
- Streak-System (tägliche Rückkehr-Motivation)

#### Welt
- Statische isometrische Karte mit 10 Bauplätzen
- 5 Gebäude-Typen (Haus, Sägewerk, Mine, Marktplatz, Turm)
- Sofortiger Bau (kein Timer), Level 1 only

#### Monetarisierung
- RevenueCat + Stripe Web Subscription (Premium: Ad-free + 2× Ressourcen)
- 1 Rewarded Ad Slot (Extra-Ressourcen)
- Kein iOS/Android IAP in MVP (Web-Only-Launch)

#### Infrastruktur
- Supabase Auth (Email + Google)
- Vercel Deploy
- Basis-Tabellen (user_profiles, daily_puzzles, daily_completions, buildings, user_resources)

#### Nicht in Phase 1
- Liga-System
- Push Notifications
- iOS/Android App Store Release
- AdMob (nur Web-Ads)
- Erweiterte Animationen

---

### Phase 2 — Liga & Social (Wochen 11-16)

- Liga-System komplett (Bronze → Diamant, wöchentlicher Reset via Edge Function Cron)
- Supabase Realtime für Live-Rangliste
- Promotions/Degradations-Animationen
- Spieler-Profile mit Stats und Vergleich
- Push Notifications (Web Push, Daily Reminder)
- Automatischer Daily Puzzle Generator via Edge Function

---

### Phase 3 — Native Apps (Wochen 17-24)

- Capacitor.js iOS Build → App Store Review + Release
- Capacitor.js Android Build → Google Play Store
- AdMob Rewarded Ads (Native Mobile)
- iOS/Android IAP via RevenueCat (StoreKit / Play Billing)
- Haptic Feedback (Capacitor Haptics Plugin)
- App Icons, Splash Screens, Store Assets
- Native Share Sheet (Ergebnisse teilen)

---

### Phase 4 — Content & Tiefe (ab Woche 25)

- Erweitertes Gebäude-System: Upgrade-Stufen (1-5), Passive Boni
- Timer-basiertes Bauen (Echtzeit-Countdown)
- Mehr Welt-Fläche (freischaltbare Regionen)
- Spezial-Events (Feiertags-Puzzles, zeitbegrenzte Gebäude)
- Freundschaftssystem + gegenseitige Liga-Herausforderungen
- Vollständiger deutscher + englischer Wörterbuch-Support
- Booster-System (Doppel-Ressourcen, Extra-Leben)
- Saison-Pass (Battle-Pass-Mechanik)

---

## Anhang: Wichtige Konfigurationskonstanten

```typescript
// src/lib/constants.ts

export const GAME = {
  WHEEL_LETTER_COUNT: 7,
  MIN_WORD_LENGTH: 3,
  MAX_WORD_LENGTH: 7,
  SESSION_TIME_LIMIT_S: 300, // 5 Minuten pro freier Session
} as const;

export const RESOURCES = {
  WORD_3: { gold: 10, wood: 0, stone: 0 },
  WORD_4: { gold: 20, wood: 5, stone: 0 },
  WORD_5: { gold: 30, wood: 15, stone: 5 },
  WORD_6: { gold: 40, wood: 25, stone: 15 },
  WORD_7: { gold: 50, wood: 35, stone: 25 },
  AD_REWARD: { gold: 100, wood: 50, stone: 25 },
} as const;

export const LEAGUE = {
  TIERS: ['bronze', 'silver', 'gold', 'diamond'] as const,
  PROMOTION_TOP_N: 3,    // Top 3 steigen auf
  DEMOTION_BOTTOM_N: 3,  // Bottom 3 steigen ab
  SEASON_RESET_DAY: 1,   // Montag
  SEASON_RESET_HOUR: 0,  // 00:00 UTC
} as const;

export const SUPABASE = {
  REALTIME_LEAGUE_CHANNEL: 'league-rankings',
} as const;
```

---

*Dieses Dokument ist die alleinige Architektur-Referenz für das WordRealms Projekt. Alle Implementierungsentscheidungen sollen sich auf diesen Brief stützen. Bei Widersprüchen zwischen Code und Brief gilt der Brief als korrektiv.*

*Letzte Aktualisierung: Phase 1 MVP-Planung*

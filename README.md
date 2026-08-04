# SARE Africa — Shop Admin Panel

Admin panel for managing shops, products and stock across the SARE retail
network. An administrator signs in, sees inventory totals across every shop on a
dashboard, and creates, edits and deletes shops and products from there.

React + TypeScript + Vite on the front end, backed by a JSON Server mock REST
API reading from `db.json`.

## Live demo

**https://sare-africa-shop-admin-panel.vercel.app**

Sign in with the [demo credentials](#demo-credentials) below.

JSON Server is a dev process, so there is no server behind the deployed build.
Instead, [Mock Service Worker](https://mswjs.io) intercepts the same REST calls
in the browser and answers them from a copy of `db.json` — so create, edit and
delete all work on the live demo. Each visitor gets their own sandbox, persisted
to `localStorage`; clearing site data resets it to the seed. Local development
is unaffected and still talks to the real JSON Server.

## Technologies used

| Area              | Choice                        | Why                                                                             |
| ----------------- | ----------------------------- | ------------------------------------------------------------------------------- |
| Framework         | React 19 + TypeScript         | Required by the brief; strict mode is on throughout                             |
| Build tool        | Vite 8                        | Fast dev server, native TS, `@` path alias                                      |
| Routing           | React Router 7                | Nested layout routes make the auth guard a single wrapper                       |
| Server state      | TanStack Query 5              | Caching, loading/error states, and invalidation after every mutation            |
| HTTP              | Axios                         | One configured instance plus a single error-message translator                  |
| Forms             | React Hook Form + Zod         | Uncontrolled inputs (fewer re-renders) with one schema as the validation source |
| Styling           | Tailwind CSS 4                | Utility-first, with brand tokens defined once in `src/index.css`                |
| UI primitives     | shadcn/ui (Radix)             | Accessible dialogs, selects and menus without building them from scratch        |
| Charts            | Recharts                      | Dashboard stock-status and top-shops charts                                     |
| Notifications     | Sonner                        | Success/error toasts after every write                                          |
| Icons             | lucide-react                  | Consistent icon set                                                             |
| Mock API (dev)    | JSON Server 1.0 (beta)        | Full REST over `db.json`, as suggested in the brief                             |
| Mock API (demo)   | Mock Service Worker           | Serves the deployed build, where a dev process can't run                        |
| Tooling           | ESLint 10, typescript-eslint  | `pnpm lint` and `pnpm typecheck` both run clean                                 |

## Getting started

### Prerequisites

- Node.js 20 or newer
- pnpm (`npm install -g pnpm`) — npm and yarn work too, adjust the commands

### Install

```bash
git clone git@github.com:Guantaijp/sare-africa-shop-admin-panel.git
cd sare-africa-shop-admin-panel
pnpm install
```

### Run everything at once

```bash
pnpm dev
```

That starts both processes side by side:

| Process | URL                   | What it is                 |
| ------- | --------------------- | -------------------------- |
| `web`   | http://localhost:5173 | Vite dev server            |
| `api`   | http://localhost:4000 | JSON Server over `db.json` |

Open http://localhost:5173 and sign in with the credentials below.

### Running JSON Server on its own

```bash
pnpm mock
```

This is `json-server db.json --port 4000`. It serves three collections, each
with full REST verbs:

| Endpoint                          | Purpose                                    |
| --------------------------------- | ------------------------------------------ |
| `GET /users?email=<email>`        | Login lookup                               |
| `GET /shops` · `POST /shops`      | Shop list and creation                     |
| `PATCH /shops/:id` · `DELETE`     | Shop edit and delete                       |
| `GET /products` · `POST /products`| Product list and creation                  |
| `PATCH /products/:id` · `DELETE`  | Product edit and delete                    |

Writes are persisted straight back into `db.json`, so anything you create while
developing shows up as a diff in the repo. `git checkout db.json` resets the
seed data.

### Running the application on its own

```bash
pnpm dev:web
```

Useful when JSON Server is already running in another terminal. Without an API
on port 4000 the app still loads, but every page shows its error state.

### Demo credentials

| Email                 | Password      | Role    |
| --------------------- | ------------- | ------- |
| `admin@sare.africa`   | `Admin123!`   | admin   |
| `manager@sare.africa` | `Manager123!` | manager |

### Environment variables

Only one, and it has a working default:

| Variable       | Default                 | Purpose                    |
| -------------- | ----------------------- | -------------------------- |
| `VITE_API_URL` | `http://localhost:4000` in dev, `/api` in the production build (`.env.production`) | Base URL the app calls |

Create a `.env.local` to point at a hosted API instead:

```bash
VITE_API_URL=https://your-hosted-api.example.com
```

## Scripts

| Script           | Purpose                             |
| ---------------- | ----------------------------------- |
| `pnpm dev`       | Mock API + Vite dev server together |
| `pnpm dev:web`   | Vite dev server only                |
| `pnpm mock`      | JSON Server only (port 4000)        |
| `pnpm build`     | Typecheck then production build     |
| `pnpm typecheck` | `tsc -b` with no emit               |
| `pnpm lint`      | ESLint                              |
| `pnpm preview`   | Serve the production build          |

## Features

**Authentication** — email/password login against the mock API, validated with
React Hook Form + Zod. Invalid credentials surface an inline error; the session
is persisted to `localStorage` ("keep me signed in") or `sessionStorage`
otherwise, and restored on reload. All admin routes are guarded, signed-in users
are redirected away from `/login`, and logout clears the stored session.

**Dashboard** — totals for shops, products, stock and inventory value, plus a
stock-status breakdown, a top-5-shops-by-stock chart, and a low-stock alert list.

**Shops** — full CRUD as a card grid with logo, name, description, product count
and stock. Each shop has a detail page listing its own products and totals.
Deleting a shop that still holds products is blocked with an explanation and a
link through to those products.

**Products** — full CRUD in a table with live search (name, SKU, category,
description and shop), a shop filter, five sort orders and client-side
pagination. Search and filter state is held in the URL, so a filtered view
survives a reload and can be shared as a link. The form previews an image as
soon as a URL is entered.

**Global search** — the top bar searches shops and products together, grouped by
type and navigable with the arrow keys. Picking a shop opens its detail page;
picking a product opens the product list filtered to it. It reads from the same
query cache the pages use, so it costs no extra request.

**Throughout** — skeleton loading states, empty states that distinguish "nothing
yet" from "nothing matches your filters", retryable error states, confirmation
dialogs before destructive actions, disabled submit buttons while a request is
in flight, toasts on success and failure, light/dark themes and a responsive
layout down to mobile.

## Architecture

```
src/
  features/
    auth/         login API, session storage, context, route guards
    inventory/    REST calls + TanStack Query hooks for shops & products
  components/
    ui/           shadcn/ui primitives (generated — do not hand-edit)
    layout/       app shell: sidebar, top bar, global search, page header
    shops/        shop form + delete dialogs
    products/     product table, form + delete dialogs
    shared/       image picker, pagination, loading/error states
  pages/          one component per route
  hooks/          cross-cutting hooks (theme, URL filter state)
  mocks/          MSW handlers + seeded store (production build only)
  lib/            api client, formatters, constants
  types/          shared domain types
```

Two rules keep the structure predictable:

- **Server state lives in TanStack Query**, in
  `src/features/inventory/use-inventory.ts`. Every mutation invalidates the
  query key it touched, which is what makes the UI refresh after a create,
  update or delete without a page reload. Only the auth session is held in React
  context.
- **Pages compose, components render.** Filtering, sorting and pagination are
  computed in the page; the table and dialogs stay presentational and reusable —
  the same `ProductsTable` serves both the products list and the shop detail
  page.

Search, filter, sort and page state is kept in the URL query string by
`src/hooks/use-filter-params.ts`, so a filtered view survives a reload, can be
shared as a link, and works with the back button.

## Assumptions made

- **The mock login stands in for a real one.** JSON Server has no auth endpoint,
  so `login()` fetches the user by email and compares the password in the
  browser (`src/features/auth/auth-api.ts`). The password is stripped before the
  user reaches state or storage, but this is a mock, not authentication.
- **The deployed demo mocks the network, not the app.** Requests are intercepted
  by a service worker, so `src/features/**` issues the same axios calls in both
  environments and knows nothing about MSW. Swapping in a real API is a matter
  of pointing `VITE_API_URL` at it and deleting `src/mocks/`.
- **Both seeded users are full administrators.** `role` is stored and displayed
  in the sidebar, but nothing is gated on it — the brief describes one
  administrator persona, so a manager can do everything an admin can.
- **Stock bands follow the brief**: out of stock at 0, low stock at 1–5, in stock
  above 5. The boundary is a single constant (`LOW_STOCK_THRESHOLD` in
  `src/lib/constants.ts`) that the badges, the dashboard chart and the alert
  list all read from.
- **Prices are whole Kenyan shillings.** Currency is hardcoded to KES and inputs
  step by 1; there is no multi-currency or decimal support.
- **Images are URLs, not uploads.** JSON Server stores JSON, so both the shop
  logo and product image fields take a URL and render a live preview, with a
  fallback if the URL fails to load.
- **Only the fields the brief marks required are required.** Shop name, and
  product name, shop, price and stock. Description, logo, image, SKU and
  category are all optional.
- **Product counts and totals are derived on the client.** JSON Server has no
  joins or aggregates, so shops and products are fetched separately and matched
  on `shopId` in the UI.
- **`db.json` is the database.** JSON Server writes to it, so using the app
  mutates a tracked file. `git checkout db.json` restores the seed data.
- **SKU and category** are not in the brief. They were added because a product
  table without them looked thin, and they make the search filter more useful.

## Known limitations

- **The auth is not secure, by construction.** Route guards are a UX measure,
  not a security boundary — anyone can forge a session by writing to
  `localStorage`. Passwords sit in plain text in `db.json`, and `/users` is a
  public endpoint a real backend would never expose.
- **The "cannot delete a shop with products" rule is enforced in the UI only.**
  A direct `DELETE /shops/:id` bypasses it, because JSON Server has no
  referential integrity. In a real system this belongs in the API.
- **Everything is fetched up front.** All shops and all products load on mount,
  and search, filtering, sorting and pagination all run client-side. That is
  fine for the 24 seeded products and would not survive a real catalogue —
  server-side querying would be needed.
- **No optimistic updates.** Mutations invalidate and refetch, so there is a
  brief round-trip before a change appears. Correct, but not instant.
- **Filter state is per-page, not a global preference.** It lives in the URL, so
  it survives a reload and is shareable, but navigating to another section and
  back starts clean — there is no stored "last used" filter.
- **No automated tests.** Verification so far is `pnpm typecheck`, `pnpm lint`
  and manual testing of each flow.
- **The bundle is a single ~1 MB chunk** (~313 kB gzipped). No route-level code
  splitting yet; Recharts is the bulk of it.
- **The live demo has no real server.** JSON Server can't run on static hosting,
  so the deployed build is backed by Mock Service Worker instead. Every REST
  call the app makes is genuine — it is intercepted at the network layer, not
  stubbed in application code — but data is per-browser and never leaves the
  visitor's machine. Local development runs against the real JSON Server.
- **MSW adds ~160 kB gzipped** to the deployed build. It is a separate chunk
  loaded only in production, but it is real weight on a demo.
- **Last write wins.** There is no conflict handling if two tabs edit the same
  record.

## Future improvements

Roughly in the order I would tackle them:

1. **A real backend**, replacing both mocks. Token auth with an httpOnly refresh
   cookie, hashed passwords, and the shop-deletion rule moved server-side where
   it can't be bypassed. The swap points are `src/features/*/\*-api.ts` and the
   axios instance in `src/lib/api.ts`; `VITE_API_URL` already points the build
   anywhere.
2. **Tests.** Vitest + Testing Library over the form schemas and route guards,
   and a Playwright pass over the create → edit → delete flows for both
   entities. The MSW handlers already written for the demo would be reused as
   the test fixtures.
3. **Server-side querying and pagination**, so the product list scales past a
   few dozen rows.
4. **Optimistic updates with rollback** on the mutations, for instant feedback.
5. **Route-level code splitting** — lazy-load the dashboard so Recharts is not
   in the initial bundle.
6. **Real image uploads** to object storage instead of pasted URLs.
7. **Role-based permissions**, making `manager` read-only now that the role is
   already modelled.
8. **A product detail page**, plus bulk actions and CSV export for stock takes.

## Notes

### Theming

Brand colours are defined once as `--sare-*` tokens at the top of
`src/index.css`; the shadcn semantic tokens reference them. Light and dark
themes are both supported, the choice is persisted to `localStorage`, and all
token pairs meet WCAG AA contrast.

### TypeScript version

Pinned to TypeScript 6.x: `typescript-eslint` does not yet support the TS 7
compiler API, so TS 7 breaks `pnpm lint`. Revisit once typescript-eslint ships
TS 7 support.

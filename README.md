# SARE Africa — Shop Admin Panel

Admin panel for managing shops, products and stock across the SARE retail
network. React + TypeScript + Vite, backed by a JSON Server mock REST API.

## Getting started

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs both processes together:

| Process | URL                   | What it is                 |
| ------- | --------------------- | -------------------------- |
| `web`   | http://localhost:5173 | Vite dev server            |
| `api`   | http://localhost:4000 | JSON Server over `db.json` |

To run them separately: `pnpm dev:web` and `pnpm mock`.

### Demo credentials

| Email                 | Password      | Role    |
| --------------------- | ------------- | ------- |
| `admin@sare.africa`   | `Admin123!`   | admin   |
| `manager@sare.africa` | `Manager123!` | manager |

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

**Dashboard** — totals for shops, products, stock and inventory value, plus
stock-status and top-shops-by-stock charts and a low-stock alert list.

**Shops** — full CRUD. Deleting a shop that still holds products is blocked with
an explanation and a link to its products.

**Products** — full CRUD with live search, shop filter, sorting and pagination.

## Architecture

```
src/
  features/
    auth/         login API, session storage, context, route guards
    inventory/    REST calls + TanStack Query hooks for shops & products
  components/
    ui/           shadcn/ui primitives (generated — do not hand-edit)
    layout/       app shell: sidebar, top bar, page header
    shops/        shop form + delete dialogs
    products/     product table, form + delete dialogs
    shared/       image picker, pagination, loading/error states
  pages/          one component per route
  lib/            api client, formatters, constants
  types/          shared domain types
```

Server state lives in TanStack Query (`src/features/inventory/use-inventory.ts`);
mutations invalidate the relevant query key so views stay in sync. Only the auth
session is held in React context.

### A note on the mock login

JSON Server has no auth endpoint, so `login()` fetches the user by email and
compares the password in the browser. That is fine for a mock, but it is **not**
how real authentication works — a production login posts credentials to the
server and receives a signed token. The swap points are
`src/features/auth/auth-api.ts` and the axios instance in `src/lib/api.ts`.

### TypeScript version

Pinned to TypeScript 6.x: `typescript-eslint` does not yet support the TS 7
compiler API, so TS 7 breaks `pnpm lint`. Revisit once typescript-eslint ships
TS 7 support.

## Theming

Brand colours are defined once as `--sare-*` tokens at the top of
`src/index.css`; the shadcn semantic tokens reference them. Light and dark
themes are both supported and all token pairs meet WCAG AA contrast.

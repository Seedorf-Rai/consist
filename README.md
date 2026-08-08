# The Pact — Frontend (React + TypeScript)

A Vite + React + TypeScript client for "The Pact" group accountability app. This
is a **frontend-only** project: it does not include a backend. It's wired to
call a real backend that implements the API described in `the-pact-openapi.yaml`
(base URL configurable, defaults to `http://localhost:4000`).

## Stack

- React 18 + TypeScript
- Vite
- No router library — navigation is a small in-memory screen stack in `App.tsx`
  (mirrors the original prototype's structure, kept intentionally simple)
- `lucide-react` for icons
- Auth token persisted in `localStorage`, sent as `Authorization: Bearer <token>`

## Getting started

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your backend if not localhost:4000
npm run dev
```

Then open the printed local URL. You'll need a backend running that implements
the API (signup/login, groups, tasks, balances, internal cron routes) for
anything beyond the login screen to work.

```bash
npm run build       # type-checks and builds to dist/
npm run typecheck   # tsc --noEmit only
```

## Project structure

```
src/
  types.ts              Data model types mirrored from the OpenAPI schema
  theme.ts               Color / font tokens
  lib/
    http.ts               Low-level fetch wrapper: base URL, auth header, ApiError
    api.ts                Typed function per endpoint (api.auth.*, api.groups.*, ...)
  context/
    AuthContext.tsx       Holds the current user + token; login/signup/logout
  hooks/
    useToast.ts            Small toast/flash-message hook
  components/
    ui.tsx                 Shared primitives: Btn, Card, Input, Header, Shell, Seal, StatusChip...
    TopBar.tsx              Authenticated top bar (name + logout)
  screens/
    LoginScreen.tsx
    GroupsScreen.tsx        "My Groups"
    CreateGroupScreen.tsx
    JoinGroupScreen.tsx
    GroupHomeScreen.tsx     Today's board + streaks + resolve-day
    MyTasksScreen.tsx        Add tasks, submit evidence
    ValidateScreen.tsx       Approve/reject others' submitted tasks
    BalancesScreen.tsx       Net balance + transaction log + redeem
    AdminScreen.tsx          Stake, kick members, delete group
  App.tsx                 Auth gate + screen router
  main.tsx                Entry point
```

Every screen fetches its own data with the typed functions in `src/lib/api.ts`,
shows a spinner while loading, and surfaces `ApiError` messages inline or as a
toast. There is no client-side mock data or local state standing in for the
server — all reads and writes go through the API.

## Known API gap: joining a group by name

The spec's `POST /groups/:id/join` route takes a group **id** in the path, but
the flow it's meant to support is "join by exact name + password" — the client
is never given an id up front. Two ways to close this gap on the backend:

1. Add a lookup route, e.g. `GET /groups/lookup?name=...`, that the client calls
   first to resolve the id, then calls `join` as documented; or
2. Let `:id` in the join route also accept a URL-encoded group **name** and have
   the server resolve it by exact case-insensitive match (simplest change).

Until one of these lands, `JoinGroupScreen.tsx` passes the entered name in the
`:id` slot as a best-effort placeholder — see the comment in that file.

## Auth

`AuthContext` calls `GET /me` on load if a token is present in `localStorage`,
to restore the session. `login`/`signup` store the returned token and user.
`logout` calls `POST /auth/logout` (a documented no-op) and clears local state.

## Notes

- `daily_stake` is constrained client-side to `100 / 200 / 500` per the spec.
- The "Resolve Day" button on Group Home is only enabled once every member's
  board status is `approved` or `rejected`, matching §3.1 of the spec.
- Screenshots are handled as plain URLs (`screenshot_url`) — there's no file
  upload endpoint in the API spec, so evidence submission is a text field, not
  an actual upload widget.

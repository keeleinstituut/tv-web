# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (root)
```bash
yarn start        # Dev server on port 3000
yarn build        # Production build to ./build
yarn test         # Run all tests (vitest, non-interactive)
yarn lint         # ESLint check
```

Run a single test file:
```bash
yarn test src/path/to/file.test.tsx
```

### Auth server (`auth-server/`)
```bash
yarn dev          # Nodemon dev server
yarn start        # Production start
yarn test         # Jest tests
```

## Architecture Overview

This is a translation management platform ("Tõlkevarav") with two parts:

### 1. Frontend — React SPA (`src/`)

**Stack:** React 18, TypeScript, Vite, TanStack Query, React Router v7, i18next (Estonian locale), SCSS modules, Tailwind CSS, Radix UI.

**Entry point:** `src/index.tsx` wraps the app in `QueryClientProvider → AuthProvider → RouterProvider`, with a global `NotificationRoot`.

**Routing (`src/router/router.tsx`):** All routes are protected. The router uses `AuthWrapper` as the root element, which shows a `Landing` page when unauthenticated and `Outlet` (→ `MainLayout`) when authenticated. Routes are defined as `FullRouteObject[]` — an extended `RouteObject` type that adds `label`, `Icon`, `privileges`, and `breadcrumb` fields. The sidebar nav is built from these route definitions. Route access is controlled via `Privileges` enum.

**API layer (`src/api/`):**
- `ApiClient.ts` — Axios-based class with CSRF token management (`X-CSRF-Token` header), `withCredentials: true` on all requests, and retry logic for 429/5xx/401 errors (max 2 retries).
- `endpoints.ts` — All API URLs are constructed via a `gateway()` helper that reads `REACT_APP_GATEWAY_BASE` env var. Backend services: `authorization`, `translation-order`, `translation-memory`, `audit-log`.
- `api/index.ts` — Exports a singleton `apiClient` instance.
- `src/hooks/requests/` — Per-domain TanStack Query hooks wrapping `apiClient`.

**Auth flow (`src/components/contexts/AuthContext.tsx`):** Polls `/context` endpoint every 60s to check session state and get CSRF token. Handles multi-institution selection via modal. Monitors session expiry and shows countdown notifications.

**Component structure:** Atomic design — `atoms/`, `molecules/`, `organisms/`, `templates/`. Modals are registered in `components/organisms/modals/ModalRoot.tsx` with a `ModalTypes` enum pattern.

**Imports:** TypeScript paths are configured with `baseUrl: "src"`, so all imports are absolute from `src/` (e.g. `import Foo from 'components/atoms/Foo/Foo'`).

**SVGs:** Import as React components using `?react` suffix: `import Icon from 'assets/icons/foo.svg?react'`.

**Styling:** SCSS modules (`.module.scss`) per component. Global styles in `src/styles/`. Tailwind CSS also available via `tailwind.config.js`.

**i18n:** Estonian (`et`) only. Translation strings in `src/i18n/locales/et.json`. Use `i18n.t('key')` or the `useTranslation` hook.

### 2. Auth Server — Node.js/Express (`auth-server/`)

A BFF (Backend for Frontend) that:
- Handles OIDC authentication via `express-openid-connect` (OAuth2 PKCE flow)
- Manages sessions in Redis (`connect-redis`)
- Acts as a **reverse proxy** forwarding authenticated requests to backend microservices
- Injects CSRF tokens into sessions
- Optionally publishes audit log events to RabbitMQ (AMQP)
- Has a `/direct` route group for proxying without session middleware

**Key env vars for auth-server:** `APP_SECRET`, `APP_URL`, `REDIS_URL`, `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`, `OAUTH_ISSUER`, `REACT_APP_GATEWAY_BASE` (frontend), `TRANSLATION_ORDER_SERVICE_BASE_URL`, `AUTHORIZATION_SERVICE_BASE_URL`, `TRANSLATION_MEMORY_SERVICE_BASE_URL`, `AUDIT_LOG_SERVICE_BASE_URL`, `ENABLE_AUDIT_LOG` (default `true`).

### Deployment

Docker Compose is provided at both root (frontend) and `auth-server/` levels. Kubernetes Helm charts are in `helm/`. The frontend is served as a static build; the auth-server runs as a Node.js service behind the gateway.

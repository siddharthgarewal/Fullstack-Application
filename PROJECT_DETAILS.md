# React Component Lifecycle in Functional Components

This document explains lifecycle behavior for functional components and maps it to actual usage in this app.

## 1) Functional lifecycle overview

### Render phase

- React calls the component function to compute JSX.
- Keep this phase pure (no subscriptions, timers, DOM mutation, or network calls directly in the function body).
- `useMemo` and `useCallback` run during render and only memoize computed values/functions.

### Pre-commit phase

- React prepares DOM changes before committing them.
- For apps, the practical hook tied to this moment is `useInsertionEffect` (mainly CSS-in-JS style injection).
- Most apps do not need this hook.

### Commit phase

- React applies DOM updates.
- `useLayoutEffect` runs synchronously after DOM mutation and before paint.
- Browser paints.
- `useEffect` runs after paint for non-blocking side effects (fetching, subscriptions, listeners, logging).

## 2) Mount, update, unmount mapping

### Mount (first commit)

- `useEffect(() => { ... }, [])` runs after first paint.
- Common work: initial data fetch, initial event listener setup, initial sync with storage.

### Update (re-render + commit)

- Any state/prop/context change triggers render again.
- Effects re-run when one of their dependencies changes.
- Before re-running an effect, React runs its previous cleanup.

### Unmount

- Cleanup function returned by an effect executes.
- Use cleanup to remove listeners, cancel subscriptions, clear timers, abort requests.

## 3) Error boundaries in React

- Error boundaries catch rendering/lifecycle errors in a subtree and show fallback UI.
- Native React error boundaries are class-based under the hood.
- In functional apps, it is common to use `react-error-boundary` which exposes function-friendly components while still using boundary semantics.

## 4) Is this used in apps/main-ui?

### Yes, heavily used

- `useEffect` is used across the app for side effects:
  - [src/App.tsx](src/App.tsx#L122)
  - [src/pages/login/Login.tsx](src/pages/login/Login.tsx#L23)
  - [src/components/custom-dropdown/CustomDropdown.tsx](src/components/custom-dropdown/CustomDropdown.tsx#L35)
- `useRef` is used for mutable values and DOM refs:
  - [src/pages/login/Login.tsx](src/pages/login/Login.tsx#L8)
  - [src/components/charts/hooks/drag-n-drop.ts](src/components/charts/hooks/drag-n-drop.ts#L52)
- `useMemo` is used for render-time memoization:
  - [src/components/data-table/DataTable.tsx](src/components/data-table/DataTable.tsx#L58)
- `useCallback` is used to stabilize callbacks:
  - [src/components/charts/hooks/drag-n-drop.ts](src/components/charts/hooks/drag-n-drop.ts#L80)

### Cleanup/unmount behavior is used

- Listener teardown pattern in effect cleanup:
  - [src/components/custom-dropdown/CustomDropdown.tsx](src/components/custom-dropdown/CustomDropdown.tsx#L39)
- Mount/unmount listener registration cleanup:
  - [src/components/charts/hooks/drag-n-drop.ts](src/components/charts/hooks/drag-n-drop.ts#L130)

### Error boundaries are used

- App-level boundary wraps the root app tree:
  - [src/bootstrap.tsx](src/bootstrap.tsx#L22)
- Feature-level boundaries isolate risky sections:
  - [src/pages/dashboard/management/dashboard-page/DashboardPage.tsx](src/pages/dashboard/management/dashboard-page/DashboardPage.tsx#L523)
  - [src/pages/dashboard/management/well-details/WellDetails.tsx](src/pages/dashboard/management/well-details/WellDetails.tsx#L1221)
  - [src/components/well-production/WellProduction.tsx](src/components/well-production/WellProduction.tsx#L698)
- Shared fallback and logger used by boundaries:
  - [src/components/error-boundary/Fallback.tsx](src/components/error-boundary/Fallback.tsx)
  - [src/components/error-boundary/LogError.tsx](src/components/error-boundary/LogError.tsx)

### Suspense and lazy loading are used

- Route-level `Suspense` wrappers and lazy imports:
  - [src/App.tsx](src/App.tsx#L193)
  - [src/App.tsx](src/App.tsx#L23)

### StrictMode is used

- Root is wrapped with `StrictMode`:
  - [src/bootstrap.tsx](src/bootstrap.tsx#L21)
- There is a guard pattern in login flow to avoid duplicate start behavior in dev:
  - [src/pages/login/Login.tsx](src/pages/login/Login.tsx#L8)

### Not found in this app (at scan time)

- `useLayoutEffect`
- `useInsertionEffect`
- Class component lifecycle methods (`componentDidMount`, `componentDidUpdate`, `componentWillUnmount`)
- Class error boundary methods (`componentDidCatch`, `getDerivedStateFromError`)

## 5) React DOM APIs and built-in components

This section covers: `createRoot`, `hydrateRoot`, `createRef`, `createPortal`, `flushSync`, `Fragment`, `Suspense`, `StrictMode`, and `Profiler`.

### APIs

- `createRoot`
  - Purpose: Creates a React 18 root for client-side rendering.
  - Usage in this app: Used.
  - Reference: [src/bootstrap.tsx](src/bootstrap.tsx#L18)

- `hydrateRoot`
  - Purpose: Attaches React to server-rendered HTML (SSR hydration).
  - Usage in this app: Not found at scan time.

- `createRef`
  - Purpose: Creates refs (primarily in class components; functional components typically use `useRef`).
  - Usage in this app: Not found at scan time.

- `createPortal`
  - Purpose: Renders children into a different DOM subtree (e.g., modals/tooltips).
  - Usage in this app: Not found at scan time.

- `flushSync`
  - Purpose: Forces React to flush state updates synchronously in specific edge cases.
  - Usage in this app: Not found at scan time.

### Components

- `Fragment`
  - Purpose: Groups children without extra DOM nodes.
  - Usage in this app: Used as both `React.Fragment` and `Fragment`.
  - References:
    - [src/pages/login/Login.tsx](src/pages/login/Login.tsx#L42)
    - [src/pages/dashboard/management/global-alarm-configuration-page/AccordtionItem.tsx](src/pages/dashboard/management/global-alarm-configuration-page/AccordtionItem.tsx#L395)

- `Suspense`
  - Purpose: Shows fallback UI while lazy-loaded components are loading.
  - Usage in this app: Used.
  - References:
    - [src/App.tsx](src/App.tsx#L193)
    - [src/pages/dashboard/management/well-details/WellDetails.tsx](src/pages/dashboard/management/well-details/WellDetails.tsx#L1222)

- `StrictMode`
  - Purpose: Development-only checks for unsafe patterns and side effects.
  - Usage in this app: Used at root.
  - Reference: [src/bootstrap.tsx](src/bootstrap.tsx#L21)

- `Profiler`
  - Purpose: Measures rendering performance for a subtree.
  - Usage in this app: Not found at scan time.

## 6) Practical summary for this codebase

- Lifecycle in this app is primarily managed with `useEffect` + cleanup.
- Performance-sensitive render work is handled with `useMemo`/`useCallback` where needed.
- Error containment is implemented with `react-error-boundary` at both root and feature levels.
- React DOM integration uses `createRoot` with `StrictMode` and `Suspense`.
- `hydrateRoot`, `createRef`, `createPortal`, `flushSync`, and `Profiler` are currently not present.
- Pre-commit and class lifecycle APIs are currently not part of this codebase.

## 7) Redux, authentication, and security implementation in main-ui

### Redux implementation

- Store setup is done with Redux Toolkit `configureStore` in [src/app/store.ts](src/app/store.ts#L15).
- The store combines UI state slices (`timeRangeFilter`, `utcToggle`, `tenant`, `takeAction`, `zoom`, `activeEnactivePump`) plus RTK Query reducers for API domains in [src/app/store.ts](src/app/store.ts#L16).
- The app is wired to Redux at bootstrap using `StoreProvider` in [src/bootstrap.tsx](src/bootstrap.tsx#L23).
- Typed hooks (`useAppSelector`, `useAppDispatch`) are defined in [src/app/hooks.ts](src/app/hooks.ts#L4).
- API calls are standardized through RTK Query:
  - Base API slice in [src/features/envService/envServiceSlice.ts](src/features/envService/envServiceSlice.ts#L4)
  - Endpoint injection pattern in [src/features/login/loginApiSlice.ts](src/features/login/loginApiSlice.ts#L3)

### Authentication implementation

- Login entry flow:
  - `Login` page calls `loginUser(...)` in [src/pages/login/Login.tsx](src/pages/login/Login.tsx#L31).
  - `loginUser` validates session by calling `/user` with `credentials: 'include'` in [src/utils/auth.ts](src/utils/auth.ts#L16).
  - On `401`, it requests `/login?redirect_uri=...` and redirects browser to returned IdP URL in [src/utils/auth.ts](src/utils/auth.ts#L47).

- Central unauthorized handling for API requests:
  - RTK Query base layer uses `credentials: 'include'` and retry logic in [src/app/customBaseQuery.ts](src/app/customBaseQuery.ts#L12).
  - Any API `401` triggers redirect to `/` (and preserves redirect path on specific routes) in [src/app/customBaseQuery.ts](src/app/customBaseQuery.ts#L33).

- Route guarding behavior in current code:
  - `ProtectedRoute` currently returns children directly (no explicit check) in [src/components/protected-route/ProtectedRoute.tsx](src/components/protected-route/ProtectedRoute.tsx#L1).
  - Effective access gating is currently driven mostly by data readiness / tenant availability checks in `App` routing logic, with auth error fallback in [src/App.tsx](src/App.tsx#L322).

### Security implementation (frontend-visible)

- Present in current frontend:
  - Cookie/session-based request model via `credentials: 'include'` in [src/app/customBaseQuery.ts](src/app/customBaseQuery.ts#L13) and [src/utils/auth.ts](src/utils/auth.ts#L18).
  - Forced re-authentication path on `401` in [src/app/customBaseQuery.ts](src/app/customBaseQuery.ts#L33).
  - Tenant context is sent in request headers (`tenantshortname`) in API slices such as [src/features/alert/alertApiSlice.ts](src/features/alert/alertApiSlice.ts#L23).
  - Cache-control header is set for API requests in [src/app/customBaseQuery.ts](src/app/customBaseQuery.ts#L9).

- Data stored on client (important security context):
  - Session storage holds tenant and environment context (e.g., `defaultTenant`, `displayNames`, `uom`) from [src/App.tsx](src/App.tsx#L124).
  - Local storage stores items like `redirectPath`, feature flags, and app preferences in [src/app/customBaseQuery.ts](src/app/customBaseQuery.ts#L45) and [src/App.tsx](src/App.tsx#L161).

- Not found in this frontend code (scan-time):
  - Explicit client-side CSRF token handling.
  - Explicit CSP/XSS sanitization utilities in `main-ui` source.
  - Active authorization checks inside `ProtectedRoute`.

Note: Some controls (CSRF enforcement, secure/HttpOnly/SameSite cookie policy, CSP headers, RBAC authorization) are commonly implemented server-side and may exist outside this frontend app.

## 8) Webpack, Vite, and microfrontend configuration (separate explanation)

### A) Webpack configuration

In this workspace, webpack is the primary bundler for `main-ui` and all `deployable-*` frontend remotes.

- `main-ui` webpack entry/output/dev server:
  - Entry: `./src/main.tsx` in [webpack.config.js](webpack.config.js#L54)
  - Output path and `publicPath: '/'` in [webpack.config.js](webpack.config.js#L56)
  - Dev server on port `5004` in [webpack.config.js](webpack.config.js#L60)

- Production mode behavior in `main-ui`:
  - Switch to `production`, enable minification (`TerserPlugin`), and extract CSS (`MiniCssExtractPlugin`) in [webpack.config.js](webpack.config.js#L152).

- Common loader pipeline:
  - TypeScript via `ts-loader`, styles via `css-loader`/`sass-loader`, and static assets via webpack asset modules in [webpack.config.js](webpack.config.js#L121).

- Build scripts confirm webpack is used for app runtime bundles:
  - `main-ui` scripts `dev` and `build` use webpack in [package.json](package.json#L7).
  - Example remote (`deployable-esp`) also uses webpack scripts in [../deployable-esp/package.json](../deployable-esp/package.json#L27).

### B) Vite configuration

Vite exists in this workspace, but for `main-ui` it is used for testing configuration (Vitest), not runtime bundling.

- `main-ui` Vite config is a Vitest-focused config:
  - Test environment (`jsdom`), setup file, and coverage rules in [vite.config.js](vite.config.js#L5).
  - Aliases map microfrontend imports (for tests) to local workspace component paths in [vite.config.js](vite.config.js#L25).

- `main-ui` runtime scripts still use webpack (not vite):
  - See `dev`/`build` scripts in [package.json](package.json#L7).

- Other apps do use Vite for build workflows:
  - Example: [../apc-portal/vite.config.ts](../apc-portal/vite.config.ts#L1) defines a Vite build pipeline with Rollup output settings.

### C) Microfrontend configuration

This project uses Webpack Module Federation with `main-ui` as host/container and multiple `deployable-*` apps as remotes.

- Host (`main-ui`) federation setup:
  - `ModuleFederationPlugin` configured in [webpack.config.js](webpack.config.js#L80).
  - Host name: `LeucipaContainer` in [webpack.config.js](webpack.config.js#L81).
  - Remotes are loaded dynamically via `loadRemote(...)` using URLs from `/assets/env.json` in [webpack.config.js](webpack.config.js#L16).
  - Remote URL keys are defined in [env.json](env.json#L5).

- Runtime remote consumption:
  - Remote modules are imported with `React.lazy(() => import('deployable_x/...'))` in [src/pages/dashboard/management/well-details/WellDetails.tsx](src/pages/dashboard/management/well-details/WellDetails.tsx#L93).

- Remote apps federation setup (example):
  - `deployable-esp` exposes modules via `ModuleFederationPlugin` in [../deployable-esp/webpack.config.js](../deployable-esp/webpack.config.js#L30).
  - Example exposes: `./ESPTrends`, `./constants`, `./ESPTrendsTypes` in [../deployable-esp/webpack.config.js](../deployable-esp/webpack.config.js#L33).
  - Another remote (`deployable-gas-interference`) exposes `./GasInterferenceRecommendation` in [../deployable-gas-interference/webpack.config.js](../deployable-gas-interference/webpack.config.js#L35).

- Shared dependency strategy across host/remotes:
  - `shared-ui`, `uom-conversion`, `react`, and `react-dom` are declared as shared singletons in host config [webpack.config.js](webpack.config.js#L97) and remote config [../deployable-esp/webpack.config.js](../deployable-esp/webpack.config.js#L37).

Practical takeaway:

- Webpack = runtime bundling + module federation host/remotes.
- Vite (in `main-ui`) = test-time tooling and aliasing for Vitest.
- Microfrontend integration = dynamic remote loading from env-configured URLs + lazy imports of exposed remote modules.

## 9) Authentication and authorization in this codebase

This application uses server-managed sessions and cookies for authentication. The frontend does not own the identity state; it only triggers login, forwards credentials, and reacts to `401` responses.

### Frontend authentication flow

- The login page in [src/pages/login/Login.tsx](src/pages/login/Login.tsx) is the entry point for auth recovery.
- It calls `loginUser(...)` from [src/utils/auth.ts](src/utils/auth.ts), which first validates the current session by calling `GET /user` with `credentials: 'include'`.
- If `/user` returns `401`, the frontend calls `GET /login?redirect_uri=...` on the backend and follows the returned identity provider URL.
- After successful authentication, the backend redirects back to the saved redirect URI and the app resumes loading protected data.
- The global RTK Query wrapper in [src/app/customBaseQuery.ts](src/app/customBaseQuery.ts) also watches for `401` responses and forces the browser back to `/` so the login flow can restart.
- The app stores `redirectPath` in `localStorage` when a protected request fails, so the user can return to the page they were on after re-authentication.

### Frontend authorization behavior

- `ProtectedRoute` in [src/components/protected-route/ProtectedRoute.tsx](src/components/protected-route/ProtectedRoute.tsx) currently returns its children directly.
- That means route protection is not enforced by a dedicated client-side authorization check.
- Instead, the app relies on authenticated backend requests and route rendering conditions in `App.tsx`.
- The main user-visible fallback for unauthorized access is the `AuthError` screen and the forced redirect back to the login flow.
- Tenant context is also part of the client-side authorization story: the app stores `defaultTenant`, `displayNames`, and related values in `sessionStorage`, then sends `tenantshortname` headers with API requests.

### Backend authentication flow

- The backend auth implementation lives in the shared plugin [packages/auth-plugin/src/index.ts](packages/auth-plugin/src/index.ts).
- `fastify-session` and `@fastify/cookie` are used to create a cookie-backed session.
- Session data is stored in Redis through `RedisSessionStore`, with expiry controlled by `SESSION_MAX_AGE` and the Redis TTL settings.
- The auth plugin registers CORS with `credentials: true`, which is required for the browser to send the session cookie.
- The `preHandler` hook blocks any request that does not have either an authenticated session or a valid `Bearer` token, unless the route is explicitly exempted.
- The login flow uses `/login` to obtain an authorization URL, `/callback` to exchange the provider code for tokens, and `/user` to expose the current session user.
- During callback, the backend verifies the Leucipa JWT, stores the authenticated user in `request.session.user`, and marks the session as authenticated.

### Backend authorization behavior

- The backend is primarily session-authenticated and tenant-scoped, not heavily role-based in the code currently visible here.
- `apps/main-server/src/index.ts` registers the auth plugin before the routes, so all non-whitelisted routes are protected by the session gate.
- Route schemas attach a required `Tenantshortname` header for most routes, which means tenant context is mandatory for normal API calls.
- Controllers read `request.session` and `tenantshortname` to build tenant-specific OpenSearch index names and fetch tenant-specific data.
- In practice, authorization is implemented as: authenticated user + valid tenant context + backend route/controller scoping.
- `main-server` does not appear to implement a separate frontend-visible role matrix in the files reviewed here, so access control is mostly enforced by session validity and tenant isolation.

### What happens when auth expires

- When the session expires, the next authenticated request returns `401`.
- The frontend immediately redirects to `/`.
- If the failed request happened while the user was on a protected page, the current URL is preserved in `localStorage`.
- The login page retries session validation and either restores the user to the app or continues the external login flow.

### Expected interview questions and answers

1. **Q: How is authentication implemented in `main-ui`?**
   A: It is session-based. The UI sends requests with `credentials: 'include'`, checks the current session via `/user`, and redirects to the backend `/login` flow when the session is invalid.

2. **Q: What happens when a token or session expires?**
   A: The next request that depends on auth gets a `401`. The app redirects to `/`, stores the current route if needed, and restarts the login flow.

3. **Q: Where is authorization enforced?**
   A: Mostly on the backend. The auth plugin blocks unauthenticated requests in a `preHandler`, and `main-server` also requires tenant context through the `Tenantshortname` header.

4. **Q: Is `ProtectedRoute` actually enforcing access control?**
   A: Not really. In the current code it just renders its children. Real gating happens through backend session checks and by only rendering protected views after auth-driven data is available.

5. **Q: Why is `credentials: 'include'` important?**
   A: It makes the browser send the session cookie with API requests, which is necessary for Fastify session authentication to work.

6. **Q: Why does the backend need both session and tenant information?**
   A: Session identifies the authenticated user, while tenant information scopes data access and determines which OpenSearch index or backend dataset should be used.

7. **Q: What is the main security control in this implementation?**
   A: Server-side session validation combined with tenant-scoped API access. The frontend mainly reacts to auth failures rather than enforcing security itself.

## Main UI

This application uses a server-backed login session rather than a client-managed token lifecycle. In the current implementation, there is no proactive refresh flow or token-expiry banner in the UI.

### What happens when the session expires

1. Any API request that receives a `401` response is handled by the shared RTK Query base query in [src/app/customBaseQuery.ts](src/app/customBaseQuery.ts).
2. The app redirects the browser to `/` immediately.
3. If the failed request was `/user` and the user was on a protected route, the current URL is saved in `localStorage` as `redirectPath` so the app can restore the navigation after login.
4. The login screen in [src/pages/login/Login.tsx](src/pages/login/Login.tsx) shows `Trying to log you in ...`, calls `/user` again, and then follows the backend login flow if the user is still unauthorized.
5. `ProtectedRoute` currently does not block access on its own; the real protection comes from the authenticated API calls and the login redirect flow.

### User-facing result

When the session expires, the user is kicked back to the login flow on the next authenticated request. If login succeeds, the app returns to the dashboard or the saved route. If login does not succeed, the backend authentication flow continues and the user remains outside the protected area.

### Relevant files

- [src/app/customBaseQuery.ts](src/app/customBaseQuery.ts)
- [src/utils/auth.ts](src/utils/auth.ts)
- [src/pages/login/Login.tsx](src/pages/login/Login.tsx)
- [src/components/protected-route/ProtectedRoute.tsx](src/components/protected-route/ProtectedRoute.tsx)

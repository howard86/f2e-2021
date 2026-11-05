# Replacing Redux Toolkit + RTK Query in apps/bus and apps/ubike

Date: 2026-11-05 · Branch: feat/browser-search-cache

## Current state

Redux holds no client state. Both reducers are `combineReducers({ [localApi.reducerPath]: localApi.reducer })` and nothing else (`apps/bus/src/redux/reducer.ts:5-7`, `apps/ubike/src/redux/reducer.ts:5-7`). There is no `createSlice`, `useSelector`, `useDispatch` or typed-hook file anywhere in `apps/` or `libs/`. The store exists only to host RTK Query: `configureStore` plus `localApi.middleware` (`apps/*/src/redux/store.ts:7-13`), mounted by `ReduxProvider` in `apps/*/src/app/providers.tsx:24`. Local UI state (city, tab, selected stop, disclosures) is already `useState`/context (`MapContextProvider`).

RTK Query surface (all fetches go to same-origin `/api`):

| App | Endpoint | Hook | Call site | Notes |
|---|---|---|---|---|
| bus | `getBusEstimation` (query) | `useGetBusEstimationQuery` | `apps/bus/src/app/city/[city]/[routeName]/view.tsx:86-96` | `pollingInterval: THIRTY_SEC_IN_MS`; `selectFromResult` picks one stop via `busEstimationSelector.selectById`; uncached |
| bus | `getBusRoutes` (query) | `useLazyGetBusRoutesQuery` | `apps/bus/src/app/city/view.tsx:42`, fired from a debounced effect `:59-68` | browser-cached DAY/30 DAY (`services/local.ts:25`) |
| bus | `getNearByBus` (mutation) | `useGetNearByBusMutation` | `apps/bus/src/app/nearby/view.tsx:37`, `.unwrap()` at `:62` | coords rounded to 3 dp for the cache key; browser-cached |
| ubike | `getCyclingByCity` (query) | `useGetCyclingByCityQuery` | `apps/ubike/src/components/home-view.tsx:64` (`skip` option) | browser-cached 7 DAY/30 DAY; `keepUnusedDataFor` 1 h |
| ubike | `getStationsByCoordinate` (query) | `useLazyGetStationsByCoordinateQuery` | `apps/ubike/src/components/map.tsx:49`, `.unwrap()` at `:60` | uncached, live availability |

Normalization: `createEntityAdapter` is used once, in bus (`services/local.ts:18-20`, `addMany` at `:38-41`), and its only consumer is a single `selectById` for the selected stop (`view.tsx:94`). Ubike's `uids`/`entities` shape arrives pre-normalized from the API route.

`libs/browser-cache`: `index.ts:67` `cached(key, load, policy, {force, signal})` is framework-free stale-while-revalidate over IndexedDB. `rtk.ts:49` `withBrowserCache` is a ~35-line adapter that wraps `fetchBaseQuery`, keyed by `${endpoint}:${url?params}`, mapping `api.forced` to `force`. It is the only reason `@reduxjs/toolkit` appears in the lib's package.json (optional peer, `package.json:16-26`). `apps/scene` already runs without Redux or a fetching lib: plain fetch plus `cached()` in `apps/scene/src/components/search/global-search.tsx:98`.

Deps per app: `@reduxjs/toolkit ^2.14.0` (`apps/*/package.json:43`) and `react-redux ^9.3.1` (`:50`). Bundlephobia reports `@reduxjs/toolkit@2.14.0` at 14.6 kB gzip (whole package; tree-shaking will reduce it, and react-redux is extra and not measured here).

## Candidates

Sizes are bundlephobia whole-package gzip, queried 2026-11-05; real tree-shaken cost is lower.

| Option | Size (gzip) | React 19 / App Router | Polling | Lazy / imperative | Normalization | Fit with `cached()` |
|---|---|---|---|---|---|---|
| TanStack Query 5.106.1 | 13.3 kB | peer `^18 \|\| ^19`; needs `'use client'` provider, documented App Router guide | `refetchInterval` (name from memory; the fetched guide did not cover it) | `useMutation`, or `queryClient.fetchQuery`, or `enabled:false` + `refetch` | none built in; `select` option or `useMemo` | Wrap `queryFn` with `cached()`, or replace with `persistQueryClient` + a custom IndexedDB persister (doc has an `idb-keyval` example). Persister restores the whole dehydrated cache, default maxAge 24 h, and requires `gcTime >= maxAge`; it has no per-endpoint freshFor/maxAge, so it does not reproduce current policies |
| SWR 2.5.1 | 5.7 kB | peer includes `^19` | `refreshInterval: number \| (latestData) => number` ([types.ts](https://github.com/vercel/swr/blob/main/src/_internal/types.ts)) | `useSWRMutation` `trigger()` does not run until called, throws on error (try/catch replaces `.unwrap()`); or a conditional key | none; plain `useMemo` | Wrap the fetcher with `cached()`. `provider` cache API is synchronous Map-like, so IndexedDB would need an in-memory layer; unnecessary since `cached()` already owns persistence |
| Zustand 5.0.16 | 0.5 kB | peer `react >=18` | hand-rolled `setInterval` | hand-rolled async actions | hand-rolled | No dedupe, loading/error, or cancellation; reimplements what RTKQ gives |
| Jotai 3.0.1 | 3.3 kB | peer `react >=18` | hand-rolled (`atomWithQuery` lives in a separate integration package, unverified) | async atoms | hand-rolled | Same gap as Zustand |
| Plain React (`useState`/`useEffect`/`use()`) | 0 | native | `setInterval` effect | event handler `await cached(...)` | `useMemo` Map | Exactly the `apps/scene` pattern; each hook re-implements abort and stale-response guards |

Zustand and Jotai solve client-global state, of which these apps have none. The real need is server-state: one polled query, three imperative lookups, two cached reads.

## Recommendation: SWR, fetchers wrapped in `cached()`, drop Redux entirely

Rationale:
- It covers all five call sites with built-in primitives (polling, key-based dedupe, `skip` via null key, imperative `trigger`) at about 5.7 kB gzip against 14.6 kB for RTK alone, before counting react-redux.
- It adds no second cache layer to reason about. Persistence, freshness windows and `force` stay in `cached()`, which already carries the per-endpoint policies and has tests (`libs/browser-cache/index.test.ts`). TanStack's persister would replace `cached()` with coarser, whole-cache semantics, so it costs more migration for less control.
- The case for staying plain (scene precedent) is real, but polling with visibility/focus handling and race-free debounced search are the two places hand-rolled hooks get subtly wrong. SWR is the smallest dependency that removes that risk. If you prefer zero deps, the same file changes apply with small hand-written hooks instead of `useSWR`.

Sketch per call site:
- Estimations: `useSWR(['bus/estimation', city, routeName], ([, c, r]) => getJson(...), { refreshInterval: THIRTY_SEC_IN_MS })`; `selectedBusEstimation = useMemo(() => data?.find(e => e.StopUID === selectedStopId), ...)`. Delete the adapter.
- Route search (`city/view.tsx`): replace debounce-in-effect + lazy trigger with a debounced `searchString` state feeding the key (null when empty); fetcher is `cached('getBusRoutes:...', load, {freshFor: DAY, maxAge: 30*DAY})`.
- Nearby (bus) and stations (ubike): `useSWRMutation(key, (_, {arg}) => ...)`; `await trigger(pos)` inside the existing try/catch; `isMutating` replaces `isFetching`.
- Cycling: `useSWR(tabIndex === 1 && selectedCity ? ['cyclings', selectedCity] : null, ...)` with `cached(..., {freshFor: 7*DAY, maxAge: 30*DAY})`.

## Migration impact

Shared: move the policy constants and a small `getJson(url)` helper (throw on non-2xx, as `cached()` requires) into each app's `services/`. Keep response types from `@/types/api`.

- apps/bus: edit `services/local.ts` (rewrite as fetchers/hooks), `app/providers.tsx` (remove `ReduxProvider`; optionally add `SWRConfig`), `app/city/[city]/[routeName]/view.tsx`, `app/city/view.tsx`, `app/nearby/view.tsx`, `package.json`; delete `redux/store.ts`, `redux/reducer.ts`. About 7 files.
- apps/ubike: edit `services/local.ts`, `app/providers.tsx`, `components/home-view.tsx`, `components/map.tsx`, `package.json`; delete `redux/store.ts`, `redux/reducer.ts`. About 6 files.
- libs/browser-cache: delete `rtk.ts`, its `./rtk` export, and the `@reduxjs/toolkit` dev/peer deps (`package.json:10,16-26`). `cached()`, `store.ts` and tests stay unchanged. `index.test.ts` does not cover `rtk.ts`, so no tests change.
- Root: `bun install` to prune the lockfile; add `swr` to both apps.

Behaviour changes to accept: no Redux DevTools; RTK's `keepUnusedDataFor` (ubike, 1 h) becomes SWR's in-memory lifetime plus IndexedDB for cycling; ubike stations were cached per-arg in memory by the lazy query and will now refetch each trigger unless you add a policy (the endpoint is live data, so likely fine).

## Risks and unknowns

- TanStack's `refetchInterval` option name is unverified; it only matters if TanStack is chosen.
- Bundlephobia numbers are whole-package, not tree-shaken; no real `next build` analysis was run for the apps. Measure before/after with the Next bundle analyzer if size is the deciding factor.
- SWR's `useSWRMutation` has `populateCache: false` by default, so results from `trigger` are not shared between components; both mutation sites are single-component, so this is fine.
- SWR dedupe only covers in-flight requests (default 2 s window); freshness beyond that comes from `cached()`, which is what is wanted.
- Not verified: SWR behaviour under Next 16.4.5 / React 19.3.1 specifically (peer range only). `@/redux/*` is imported only by `apps/*/src/app/providers.tsx`.

## Sources

- npm registry, peer ranges and versions: https://registry.npmjs.org/@tanstack/react-query/latest, https://registry.npmjs.org/swr/latest, https://registry.npmjs.org/zustand/latest, https://registry.npmjs.org/jotai/latest
- Bundlephobia API (gzip): https://bundlephobia.com/api/size?package=@tanstack/react-query@latest, ...swr@latest, ...zustand@latest, ...jotai@latest, ...@reduxjs/toolkit@latest
- TanStack persistQueryClient: https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient
- TanStack advanced SSR / App Router: https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
- SWR cache provider: https://swr.vercel.app/docs/advanced/cache
- SWR mutation: https://swr.vercel.app/docs/mutation
- SWR `refreshInterval` type: https://github.com/vercel/swr/blob/main/src/_internal/types.ts

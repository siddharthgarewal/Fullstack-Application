# React + Redux Toolkit + Performance Demo

This project is a basic but practical Redux Toolkit setup built with React + TypeScript + Vite.

It is designed for:

- Learning Redux Toolkit quickly
- Interview preparation with real, explainable patterns

## What This Project Demonstrates

1. `configureStore` with multiple reducers
2. `createSlice` for synchronous state updates (counter)
3. Immer-powered immutable updates using mutable syntax
4. `createAsyncThunk` for API calls with pending/fulfilled/rejected flow
5. Typed Redux hooks in TypeScript (`useAppDispatch`, `useAppSelector`)
6. Code splitting with `React.lazy` + `Suspense`
7. Bundle analysis with Vite + Rollup Visualizer
8. Tree shaking with ESM named exports

## Project Structure

```text
src/
  app/
    store.ts
    hooks.ts
  features/
    counter/
      counterSlice.ts
    posts/
      postsApi.ts
    performance/
      HeavyAnalyticsPanel.tsx
      math.ts
  App.tsx
  main.tsx
```

## Run Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Analyze bundle (opens visual report and writes `dist/stats.html`):

```bash
npm run build:analyze
```

## Performance Example Walkthrough

1. In the app UI, open the **Performance Toolkit Example** section.
2. Click **Load Lazy Analytics Panel**.
3. This triggers a dynamic import for `src/features/performance/HeavyAnalyticsPanel.tsx`, creating a separate chunk.
4. `src/features/performance/math.ts` exports several functions, but only imported functions are included in final chunks.
5. Run `npm run build:analyze` and inspect `dist/stats.html` to verify chunk boundaries and module composition.

## Interview Talking Points

1. Why Redux Toolkit is preferred over classic Redux boilerplate
2. Difference between local component state and global Redux state
3. How `extraReducers` handles async thunk lifecycle actions
4. Why TypeScript typing of `RootState` and `AppDispatch` matters
5. When to keep data in slices vs derive/computed in selectors

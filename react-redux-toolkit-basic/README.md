# React + Redux Toolkit Interview Demo

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
      postsSlice.ts
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

## Interview Talking Points

1. Why Redux Toolkit is preferred over classic Redux boilerplate
2. Difference between local component state and global Redux state
3. How `extraReducers` handles async thunk lifecycle actions
4. Why TypeScript typing of `RootState` and `AppDispatch` matters
5. When to keep data in slices vs derive/computed in selectors

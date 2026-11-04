import { configureStore } from '@reduxjs/toolkit';
import { localApi } from '@/services/local';
import reducer from './reducer';

const isDev = process.env.NODE_ENV !== 'production';

export const makeStore = () =>
  configureStore({
    devTools: isDev,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(localApi.middleware),
    reducer,
  });

export type AppStore = ReturnType<typeof makeStore>;

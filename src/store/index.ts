'use client';

import { configureStore } from '@reduxjs/toolkit';
import searchReducer from './slices/searchSlice';
import dataReducer from './slices/dataSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    search: searchReducer,
    data: dataReducer,
    ui: uiReducer,
  },
});

// Save a reference to the store in window for components that need it
if (typeof window !== 'undefined') {
  (window as any).__REDUX_STORE__ = store;
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
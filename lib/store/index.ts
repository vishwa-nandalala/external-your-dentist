// lib/store/index.ts

import { configureStore } from '@reduxjs/toolkit';
import practiceReducer from './slices/practiceSlice';
import bookingReducer from './slices/bookingSlice';

export const store = configureStore({
  reducer: {
    practice: practiceReducer,
    booking: bookingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['practice/fetchClinics/fulfilled'],
        ignoredPaths: ['practice.clinics'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
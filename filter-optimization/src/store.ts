import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './features/dataSlice';
import filtersReducer from './features/filterSlice';
// Import reducers here as you create them

export const store = configureStore({
  reducer: {
    data: dataReducer,
    filters: filtersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
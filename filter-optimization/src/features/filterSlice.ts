import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FilterState {
  [column: string]: any[];
}

const initialState: FilterState = {};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<{ column: string; values: any[] }>) {
      state[action.payload.column] = action.payload.values;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const { setFilter, resetFilters } = filterSlice.actions;
export default filterSlice.reducer; 
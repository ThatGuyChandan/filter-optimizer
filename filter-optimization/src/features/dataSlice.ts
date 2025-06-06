import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Papa from 'papaparse';

interface DataState {
  data: any[];
  columns: string[];
  loading: boolean;
  error: string | null;
}

const initialState: DataState = {
  data: [],
  columns: [],
  loading: false,
  error: null,
};

export const fetchData = createAsyncThunk(
  'data/fetchData',
  async (dataSource: string | any[], { rejectWithValue }) => {
    if (Array.isArray(dataSource)) {
      // If dataSource is an array, use it directly
      return dataSource;
    } else {
      // If dataSource is a string (URL), fetch it
      try {
        const response = await fetch(dataSource);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const text = await response.text();
        
        return new Promise<any[]>((resolve, reject) => {
          Papa.parse(text, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.errors.length > 0) {
                reject(new Error('Failed to parse CSV'));
              } else {
                resolve(results.data);
              }
            },
            error: (error: Error) => {
              reject(error);
            },
          });
        });
      } catch (err: any) {
        return rejectWithValue(err.message || 'Failed to fetch or parse data');
      }
    }
  }
);

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        if (action.payload.length > 0) {
          state.columns = Object.keys(action.payload[0]);
        } else {
          state.columns = []; // Clear columns if dataset is empty
        }
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || 'Failed to fetch data';
      });
  },
});

export default dataSlice.reducer; 
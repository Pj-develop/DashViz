'use client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchState {
  query: string;
  history: string[];
}

const initialState: SearchState = {
  query: '',
  history: [],
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
      
      // Add to history if not empty and not already in history
      if (action.payload && !state.history.includes(action.payload)) {
        state.history = [action.payload, ...state.history.slice(0, 4)];
      }
    },
    clearSearchHistory: (state) => {
      state.history = [];
    },
    // You can also include the filterData action here or in a separate slice
    filterData: (state, action: PayloadAction<string>) => {
      // This will be handled in the dataSlice
    },
  },
});

export const { setSearchQuery, clearSearchHistory, filterData } = searchSlice.actions;
export default searchSlice.reducer;
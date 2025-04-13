'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isDarkMode: boolean;
  sidebarOpen: boolean;
  activeTab: 'tabular' | 'funnel' | '3d-viz';
}

const initialState: UiState = {
  isDarkMode: false,
  sidebarOpen: true,
  activeTab: 'tabular',
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setActiveTab: (state, action: PayloadAction<'tabular' | 'funnel' | '3d-viz'>) => {
      state.activeTab = action.payload;
    },
  },
});

export const { toggleDarkMode, setDarkMode, toggleSidebar, setActiveTab } = uiSlice.actions;
export default uiSlice.reducer;
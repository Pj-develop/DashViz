'use client';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from '@/hooks/use-toast';

// Define types for your data
export interface FunnelItem {
  label: string;
  acv: number;
  count: number;
  diffRate: number;
  diffacvRate: number;
  percentageFormatted: string;
  diffRateFormatted: string;
  status: "positive" | "neutral" | "negative";
}

export interface TerritoryItem {
  Territory: string;
  Suspect: number;
  Qualify: number;
  Won: number;
  Lost: number;
  qualifyPercentage: string;
  wonPercentageRounded: number;
  Demo?: number;
  Proposal?: number;
  Negotiate?: number;
}

// Create async thunk for data fetching
export const fetchDashboardData = createAsyncThunk(
  'data/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/data');
      
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status}`);
      }
      
      const jsonData = await response.json();
      
      if (!jsonData || (!jsonData.territoriesData && !jsonData.funnelData)) {
        throw new Error('Invalid data received from server');
      }
      
      return jsonData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Define the state interface
interface DataState {
  territoriesData: TerritoryItem[];
  funnelData: FunnelItem[];
  filteredTerritoriesData: TerritoryItem[];
  filteredFunnelData: FunnelItem[];
  loading: boolean;
  error: string | null;
  sortConfig: { field: string; direction: 'asc' | 'desc' } | null;
  activeChart: 'tabular' | 'funnel' | '3d-viz';
}

// Initial state
const initialState: DataState = {
  territoriesData: [],
  funnelData: [],
  filteredTerritoriesData: [],
  filteredFunnelData: [],
  loading: true,
  error: null,
  sortConfig: null,
  activeChart: 'tabular',
};

// Create the slice
export const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setActiveChart: (state, action: PayloadAction<'tabular' | 'funnel' | '3d-viz'>) => {
      state.activeChart = action.payload;
    },
    filterData: (state, action: PayloadAction<string>) => {
      const query = action.payload.toLowerCase();
      
      // Filter territories data
      state.filteredTerritoriesData = state.territoriesData.filter(item =>
        item.Territory.toLowerCase().includes(query)
      );
      
      // Filter funnel data
      state.filteredFunnelData = state.funnelData.filter(item =>
        item.label.toLowerCase().includes(query)
      );
      
      // Reapply sorting if configured
      if (state.sortConfig) {
        const { field, direction } = state.sortConfig;
        
        // Sort territories
        if (field in (state.filteredTerritoriesData[0] || {})) {
          state.filteredTerritoriesData = [...state.filteredTerritoriesData].sort((a, b) => {
            const aValue = a[field as keyof TerritoryItem];
            const bValue = b[field as keyof TerritoryItem]; 
            
            if ((aValue ?? 0) < (bValue ?? 0)) return direction === 'asc' ? -1 : 1;
            if ((aValue ?? 0) > (bValue ?? 0)) return direction === 'asc' ? 1 : -1;
            return 0;
          });
        }
        
        // Sort funnel data
        const fieldName = field === 'label' ? 'label' : 
                         field === 'count' ? 'count' : 
                         field === 'acv' ? 'acv' : 'diffRate';
        
        state.filteredFunnelData = [...state.filteredFunnelData].sort((a, b) => {
          const aValue = a[fieldName as keyof FunnelItem];
          const bValue = b[fieldName as keyof FunnelItem];
          
          if (aValue < bValue) return direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
    },
    setSortConfig: (state, action: PayloadAction<{ field: string; direction: 'asc' | 'desc' } | null>) => {
      state.sortConfig = action.payload;
      
      if (action.payload) {
        // Apply sorting logic similar to filterData 
        // This avoids code duplication
        const currentQuery = state.filteredFunnelData.length < state.funnelData.length ? 
          state.filteredFunnelData[0]?.label.toLowerCase() || '' : '';
          
        // Reuse the filtering logic which also applies sorting
        const fakeAction = { payload: currentQuery };
        dataSlice.caseReducers.filterData(state, fakeAction as any);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        
        // Handle potential missing data from API
        if (!action.payload) {
          state.error = "No data received from API";
          return;
        }
        
        state.territoriesData = action.payload.territoriesData || [];
        state.funnelData = action.payload.funnelData || [];
        state.filteredTerritoriesData = action.payload.territoriesData || [];
        state.filteredFunnelData = action.payload.funnelData || [];
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

export const { setActiveChart, filterData, setSortConfig } = dataSlice.actions;
export default dataSlice.reducer;
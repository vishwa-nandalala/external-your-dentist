// lib/store/slices/practiceSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { practiceApi } from '@/lib/api/client';
import type { Clinic, Specialty, FilterOptions, SearchResult, LocationResult } from '@/lib/types';

interface PracticeState {
  clinics: Clinic[];
  loading: boolean;
  filterLoading: boolean;
  error: string | null;
  specialties: Specialty[];
  languages: string[];
  insurances: string[];
  availableDays: string[];
  genders: string[];
  selectedSpecialties: string[];
  selectedLanguages: string[];
  selectedGenders: string[];
  selectedInsurances: string[];
  selectedDays: string[];
  selectedService: SearchResult | null;
  selectedLocation: LocationResult | null;
  filtersApplied: boolean;
}

const initialState: PracticeState = {
  clinics: [],
  loading: false,
  filterLoading: false,
  error: null,
  specialties: [],
  languages: [],
  insurances: [],
  availableDays: [],
  genders: [],
  selectedSpecialties: [],
  selectedLanguages: [],
  selectedGenders: [],
  selectedInsurances: [],
  selectedDays: [],
  selectedService: null,
  selectedLocation: null,
  filtersApplied: false,
};

// Async thunks
export const getFilterOptions = createAsyncThunk(
  'practice/getFilterOptions',
  async () => {
    const options = await practiceApi.getFilterOptions();
    return options;
  }
);

export const fetchClinicsWithFilters = createAsyncThunk(
  'practice/fetchClinics',
  async (_, { getState }) => {
    const state = getState() as { practice: PracticeState };
    const { selectedSpecialties, selectedLanguages, selectedGenders, selectedInsurances, selectedDays, selectedService, selectedLocation } = state.practice;
    
    const params = {
      specialties: selectedSpecialties,
      languages: selectedLanguages,
      genders: selectedGenders,
      insurances: selectedInsurances,
      days: selectedDays,
      service: selectedService,
      location: selectedLocation,
    };
    
    const clinics = await practiceApi.searchClinics(params);
    return clinics;
  }
);

const practiceSlice = createSlice({
  name: 'practice',
  initialState,
  reducers: {
    setSelectedSpecialties: (state, action: PayloadAction<string[]>) => {
      state.selectedSpecialties = action.payload;
      state.filtersApplied = true;
    },
    setSelectedLanguages: (state, action: PayloadAction<string[]>) => {
      state.selectedLanguages = action.payload;
      state.filtersApplied = true;
    },
    setSelectedGenders: (state, action: PayloadAction<string[]>) => {
      state.selectedGenders = action.payload;
      state.filtersApplied = true;
    },
    setSelectedInsurances: (state, action: PayloadAction<string[]>) => {
      state.selectedInsurances = action.payload;
      state.filtersApplied = true;
    },
    setSelectedDays: (state, action: PayloadAction<string[]>) => {
      state.selectedDays = action.payload;
      state.filtersApplied = true;
    },
    setSelectedService: (state, action: PayloadAction<SearchResult | null>) => {
      state.selectedService = action.payload;
      state.filtersApplied = true;
    },
    setSelectedLocation: (state, action: PayloadAction<LocationResult | null>) => {
      state.selectedLocation = action.payload;
      state.filtersApplied = true;
    },
    clearAllFilters: (state) => {
      state.selectedSpecialties = [];
      state.selectedLanguages = [];
      state.selectedGenders = [];
      state.selectedInsurances = [];
      state.selectedDays = [];
      state.selectedService = null;
      state.selectedLocation = null;
      state.filtersApplied = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFilterOptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFilterOptions.fulfilled, (state, action) => {
        state.loading = false;
        state.specialties = action.payload.specialties || [];
        state.languages = action.payload.languages || [];
        state.insurances = action.payload.insurances || [];
        state.availableDays = action.payload.availableDays || [];
        state.genders = action.payload.genders || [];
      })
      .addCase(getFilterOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load filters';
      })
      .addCase(fetchClinicsWithFilters.pending, (state) => {
        state.filterLoading = true;
        state.error = null;
      })
      .addCase(fetchClinicsWithFilters.fulfilled, (state, action) => {
        state.filterLoading = false;
        state.clinics = action.payload;
      })
      .addCase(fetchClinicsWithFilters.rejected, (state, action) => {
        state.filterLoading = false;
        state.error = action.error.message || 'Failed to fetch clinics';
      });
  },
});

export const {
  setSelectedSpecialties,
  setSelectedLanguages,
  setSelectedGenders,
  setSelectedInsurances,
  setSelectedDays,
  setSelectedService,
  setSelectedLocation,
  clearAllFilters,
} = practiceSlice.actions;

export default practiceSlice.reducer;
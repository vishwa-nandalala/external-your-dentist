// lib/hooks/usePracticeData.ts

"use client";

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/lib/store';
import {
  getFilterOptions,
  fetchClinicsWithFilters,
  setSelectedSpecialties,
  setSelectedLanguages,
  setSelectedGenders,
  setSelectedInsurances,
  setSelectedDays,
  setSelectedService,
  setSelectedLocation,
  clearAllFilters,
} from '@/lib/store/slices/practiceSlice';
import type { SearchResult, LocationResult } from '@/lib/types';

export const usePracticeData = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    clinics,
    loading,
    filterLoading,
    error,
    specialties,
    languages,
    insurances,
    availableDays,
    genders,
    selectedSpecialties,
    selectedLanguages,
    selectedGenders,
    selectedInsurances,
    selectedDays,
    selectedService,
    selectedLocation,
    filtersApplied,
  } = useSelector((state: RootState) => state.practice);

  useEffect(() => {
    dispatch(getFilterOptions());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchClinicsWithFilters());
  }, [
    dispatch,
    selectedSpecialties,
    selectedLanguages,
    selectedGenders,
    selectedInsurances,
    selectedDays,
    selectedService,
    selectedLocation,
  ]);

  const setSpecialties = useCallback(
    (val: string[]) => dispatch(setSelectedSpecialties(val)),
    [dispatch]
  );
  
  const setLanguages = useCallback(
    (val: string[]) => dispatch(setSelectedLanguages(val)),
    [dispatch]
  );
  
  const setGenders = useCallback(
    (val: string[]) => dispatch(setSelectedGenders(val)),
    [dispatch]
  );
  
  const setInsurances = useCallback(
    (val: string[]) => dispatch(setSelectedInsurances(val)),
    [dispatch]
  );
  
  const setDays = useCallback(
    (val: string[]) => dispatch(setSelectedDays(val)),
    [dispatch]
  );
  
  const setService = useCallback(
    (val: SearchResult | null) => dispatch(setSelectedService(val)),
    [dispatch]
  );
  
  const setLocation = useCallback(
    (val: LocationResult | null) => dispatch(setSelectedLocation(val)),
    [dispatch]
  );
  
  const clearFilters = useCallback(
    () => dispatch(clearAllFilters()),
    [dispatch]
  );

  return {
    clinics,
    loading,
    filterLoading,
    error,
    filtersApplied,
    filterOptions: {
      specialties,
      languages,
      insurances,
      availableDays,
      genders,
    },
    selectedFilters: {
      specialties: selectedSpecialties,
      languages: selectedLanguages,
      genders: selectedGenders,
      insurances: selectedInsurances,
      days: selectedDays,
      service: selectedService,
      location: selectedLocation,
    },
    setSpecialties,
    setLanguages,
    setGenders,
    setInsurances,
    setDays,
    setService,
    setLocation,
    clearFilters,
  };
};
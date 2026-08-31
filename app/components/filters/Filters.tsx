// components/filters/Filters.tsx
"use client";

import React from 'react';
import FilterSection from './FilterSection';
import type { Specialty } from '@/lib/types';

interface FilterProps {
  selectedLanguages: string[];
  selectedGenders: string[];
  selectedSpecialties: string[];
  selectedInsurances?: string[];
  selectedAvailableDays?: string[];
  onLanguageChange: (languages: string[]) => void;
  onGenderChange: (genders: string[]) => void;
  onSpecialtyChange: (specialties: string[]) => void;
  onInsuranceChange?: (insurances: string[]) => void;
  onAvailableDaysChange?: (availableDays: string[]) => void;
  onClearAll: () => void;
  languages: string[];
  specialties: Specialty[];
  genderOptions: string[];
  insuranceOptions?: string[];
  availableDaysOptions?: string[];
  className?: string;
}

const Filters: React.FC<FilterProps> = ({
  selectedLanguages,
  selectedGenders,
  selectedSpecialties,
  selectedInsurances,
  selectedAvailableDays,
  onLanguageChange,
  onGenderChange,
  onSpecialtyChange,
  onInsuranceChange,
  onAvailableDaysChange,
  onClearAll,
  languages,
  specialties,
  genderOptions,
  insuranceOptions,
  availableDaysOptions,
  className = '',
}) => {
  const hasActiveFilters =
    selectedLanguages.length > 0 ||
    selectedGenders.length > 0 ||
    selectedSpecialties.length > 0 ||
    (selectedInsurances && selectedInsurances.length > 0) ||
    (selectedAvailableDays && selectedAvailableDays.length > 0);

  return (
    <div className={`bg-white border border-gray-300 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-300 rounded-t-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Filter By</h2>
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="text-xs text-orange-600 hover:text-orange-700 font-medium underline"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Sections - ALL CHECKBOXES (Multi-Select) */}
      <div className="p-4">
        {/* Specialty Filter */}
        <FilterSection
          title="Specialty"
          options={specialties}
          selectedValues={selectedSpecialties}
          onChange={onSpecialtyChange}
          displayKey="service_name"
          defaultExpanded={true}
        />

        {/* Language Filter */}
        <FilterSection
          title="Language"
          options={languages}
          selectedValues={selectedLanguages}
          onChange={onLanguageChange}
          defaultExpanded={false}
        />

        {/* Gender Filter */}
        <FilterSection
          title="Gender"
          options={genderOptions}
          selectedValues={selectedGenders}
          onChange={onGenderChange}
          defaultExpanded={false}
        />

        {/* Insurance Filter */}
        {insuranceOptions && onInsuranceChange && (
          <FilterSection
            title="Insurance"
            options={insuranceOptions}
            selectedValues={selectedInsurances || []}
            onChange={onInsuranceChange}
            defaultExpanded={false}
          />
        )}

        {/* Available Days Filter */}
        {availableDaysOptions && onAvailableDaysChange && (
          <FilterSection
            title="Available Days"
            options={availableDaysOptions}
            selectedValues={selectedAvailableDays || []}
            onChange={onAvailableDaysChange}
            defaultExpanded={false}
          />
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 rounded-b-lg">
          <div className="text-xs text-gray-600 mb-2 font-medium">Active Filters:</div>
          <div className="flex flex-wrap gap-1.5">
            {selectedSpecialties.map((item) => (
              <span
                key={item}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800"
              >
                {item}
                <button
                  onClick={() =>
                    onSpecialtyChange(
                      selectedSpecialties.filter((s) => s !== item)
                    )
                  }
                  className="ml-1 text-orange-600 hover:text-orange-800 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
            {selectedLanguages.map((item) => (
              <span
                key={item}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800"
              >
                {item}
                <button
                  onClick={() =>
                    onLanguageChange(
                      selectedLanguages.filter((l) => l !== item)
                    )
                  }
                  className="ml-1 text-orange-600 hover:text-orange-800 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
            {selectedGenders.map((item) => (
              <span
                key={item}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800"
              >
                {item}
                <button
                  onClick={() =>
                    onGenderChange(selectedGenders.filter((g) => g !== item))
                  }
                  className="ml-1 text-orange-600 hover:text-orange-800 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
            {selectedInsurances?.map((item) => (
              <span
                key={item}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800"
              >
                {item}
                <button
                  onClick={() =>
                    onInsuranceChange?.(
                      selectedInsurances.filter((i) => i !== item)
                    )
                  }
                  className="ml-1 text-orange-600 hover:text-orange-800 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
            {selectedAvailableDays?.map((item) => (
              <span
                key={item}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800"
              >
                {item}
                <button
                  onClick={() =>
                    onAvailableDaysChange?.(
                      selectedAvailableDays.filter((d) => d !== item)
                    )
                  }
                  className="ml-1 text-orange-600 hover:text-orange-800 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;
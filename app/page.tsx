// app/page.tsx

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { debounce } from "lodash";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

// Components
import Navbar from "@/app/components/layouts/Navbar";
import ServicesSection from "@/app/components/services/ServiceSection";
import ReviewCard from "@/app/components/reviews/ReviewCard";
import BrowseByState from "@/app/components/BrowseByState";
import BlogSection from "@/app/components/BlogSection";
import Footer from "@/app/components/layouts/Footer";
import Filters from "@/app/components/filters/Filters";

// Hooks & APIs
import { usePracticeData } from "@/lib/hooks/usePracticeData";
import { practiceApi } from "@/lib/api/client";
import { resetSelections, setPatientType, setSelectedPractice } from "@/lib/store/slices/bookingSlice";

// Types
import type { Specialty, SearchResult, LocationResult } from "@/lib/types";
import { clinicUrl } from "@/lib/slug";

const WEEK_ORDER = [
  "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday", "Sunday",
];

export default function HomePage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"service" | "location" | null>(null);
  const [serviceInput, setServiceInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [serviceResults, setServiceResults] = useState<SearchResult[]>([]);
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [screenWidth, setScreenWidth] = useState(1024);
  const [startIndex, setStartIndex] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    clinics,
    loading,
    filterLoading,
    error,
    filtersApplied,
    filterOptions,
    selectedFilters,
    setSpecialties,
    setLanguages,
    setGenders,
    setInsurances,
    setDays,
    setService,
    setLocation,
    clearFilters,
  } = usePracticeData();

  const [expandedAvailability, setExpandedAvailability] = useState<Record<string, boolean>>({});
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, any[]>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  // Load availability for each clinic
  const loadAvailability = async (practiceId: string) => {
    if (availabilityMap[practiceId]) return;

    setLoadingMap((prev) => ({ ...prev, [practiceId]: true }));

    try {
      const data = await practiceApi.getWidgetAvailability(practiceId);
      setAvailabilityMap((prev) => ({
        ...prev,
        [practiceId]: Array.isArray(data) ? data : [],
      }));
    } finally {
      setLoadingMap((prev) => ({ ...prev, [practiceId]: false }));
    }
  };

  useEffect(() => {
    clinics.forEach((clinic) => {
      loadAvailability(clinic.id);
    });
  }, [clinics]);

  // Screen size tracking
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const closeDropdown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  // Debounced search for services
  const searchServices = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.trim().length < 2) {
          setServiceResults([]);
          return;
        }
        setSearchLoading(true);
        try {
          const results = await practiceApi.searchServices(query);
          setServiceResults(results);
        } catch (error) {
          console.error('Service search error:', error);
          setServiceResults([]);
        } finally {
          setSearchLoading(false);
        }
      }, 300),
    []
  );

  // Debounced search for locations
  const searchLocations = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.trim().length < 2) {
          setLocationResults([]);
          return;
        }
        setSearchLoading(true);
        try {
          const results = await practiceApi.searchLocations(query);
          setLocationResults(results);
        } catch (error) {
          console.error('Location search error:', error);
          setLocationResults([]);
        } finally {
          setSearchLoading(false);
        }
      }, 300),
    []
  );

  // Trigger service search on input change
  useEffect(() => {
    if (serviceInput && !selectedFilters.service) {
      searchServices(serviceInput);
    } else if (!serviceInput) {
      setServiceResults([]);
    }
  }, [serviceInput, searchServices, selectedFilters.service]);

  // Trigger location search on input change
  useEffect(() => {
    if (locationInput && !selectedFilters.location) {
      searchLocations(locationInput);
    } else if (!locationInput) {
      setLocationResults([]);
    }
  }, [locationInput, searchLocations, selectedFilters.location]);

  // Handle service selection
  const handleServiceSelect = (result: SearchResult) => {
    setServiceInput(result.name);
    setServiceResults([]);
    setActiveDropdown(null);

    setService(result);

    if (result.type === "practitioner") {
      sessionStorage.setItem("selectedPractitionerId", result.id);
      if (result.practiceId) {
        sessionStorage.setItem("selectedPracticeId", result.practiceId);
      }
    } else {
      sessionStorage.removeItem("selectedPractitionerId");
      sessionStorage.removeItem("selectedPracticeId");
    }
  };

  // Handle location selection
  const handleLocationSelect = (location: LocationResult) => {
    setLocationInput(location.displayText);
    setLocationResults([]);
    setActiveDropdown(null);
    setLocation(location);
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    clearFilters();
    setServiceInput("");
    setLocationInput("");
    setServiceResults([]);
    setLocationResults([]);
    setActiveDropdown(null);
  };

  // Calculate cards per view
  const cardsPerView =
    screenWidth >= 1280 ? 5
    : screenWidth >= 1024 ? 5
    : screenWidth >= 768 ? 4
    : screenWidth >= 640 ? 3
    : 2;

  const visibleSpecialties = filterOptions.specialties.slice(
    startIndex,
    startIndex + cardsPerView
  );

  const showResults = filtersApplied;

  // Sort available days
  const sortedAvailableDaysOptions = useMemo(() => {
    if (!filterOptions.availableDays) return WEEK_ORDER;
    return [...filterOptions.availableDays].sort(
      (a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b)
    );
  }, [filterOptions.availableDays]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100 py-0 px-0">
      <Navbar />

      {/* Banner */}
      <div
        className="w-full bg-cover bg-center bg-no-repeat py-12 sm:py-16 md:py-20 lg:py-24 px-4"
        style={{ backgroundImage: `url('/hero.webp')` }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-100 leading-snug">
            Find <span className="text-black">Your Dentist</span> Nearby You.
          </h1>
          <p className="text-white mt-3 text-sm sm:text-base md:text-lg">
            Find, book and add your favourite practitioners to your care team.
          </p>

          {/* Search Bar */}
          <div className="w-full flex justify-center mt-10 px-4">
            <div
              ref={dropdownRef}
              className="flex flex-col sm:flex-row items-center bg-white rounded-2xl sm:rounded-full shadow-md px-4 sm:px-6 py-4 w-full max-w-2xl lg:max-w-4xl border border-gray-200 gap-3 sm:gap-0"
            >
              {/* Service Input */}
              <div className="relative w-full sm:w-1/2 flex items-center">
                <div className="flex items-center w-full">
                  <svg className="w-5 h-5 text-gray-800 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Service, practice or practitioner"
                    value={serviceInput}
                    onChange={(e) => {
                      setServiceInput(e.target.value);
                      if (selectedFilters.service) {
                        setService(null);
                      }
                      setActiveDropdown("service");
                    }}
                    onFocus={() => setActiveDropdown("service")}
                    className="w-full outline-none text-gray-700 placeholder-gray-500 bg-transparent text-sm sm:text-base pr-8"
                  />
                  {serviceInput && (
                    <button
                      onClick={() => {
                        setServiceInput("");
                        setService(null);
                        setServiceResults([]);
                        setActiveDropdown(null);
                      }}
                      className="absolute right-0 text-gray-800 hover:text-orange-500 p-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Service Dropdown */}
                {activeDropdown === "service" && serviceInput && (
                  <div className="absolute top-full left-0 right-0 bg-white shadow-xl rounded-lg mt-2 max-h-96 overflow-y-auto z-50 border border-gray-200">
                    {searchLoading ? (
                      <div className="px-4 py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">Searching...</p>
                      </div>
                    ) : serviceResults.length > 0 ? (
                      <div>
                        {/* Services */}
                        {serviceResults.filter(r => r.type === 'service').length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                              <p className="text-xs font-semibold text-gray-600 uppercase">Services</p>
                            </div>
                            {serviceResults
                              .filter(r => r.type === 'service')
                              .map((result) => (
                                <div
                                  key={`service-${result.id}`}
                                  className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                  onClick={() => handleServiceSelect(result)}
                                >
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">{result.name}</p>
                                      <p className="text-xs text-gray-500">{result.subtitle}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Practices */}
                        {serviceResults.filter(r => r.type === 'practice').length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                              <p className="text-xs font-semibold text-gray-600 uppercase">Practices</p>
                            </div>
                            {serviceResults
                              .filter(r => r.type === 'practice')
                              .map((result) => (
                                <div
                                  key={`practice-${result.id}`}
                                  className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                  onClick={() => handleServiceSelect(result)}
                                >
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">{result.name}</p>
                                      <p className="text-xs text-gray-500">{result.subtitle}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Practitioners */}
                        {serviceResults.filter(r => r.type === 'practitioner').length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                              <p className="text-xs font-semibold text-gray-600 uppercase">Practitioners</p>
                            </div>
                            {serviceResults
                              .filter(r => r.type === 'practitioner')
                              .map((result) => (
                                <div
                                  key={`practitioner-${result.id}`}
                                  className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                  onClick={() => handleServiceSelect(result)}
                                >
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">{result.name}</p>
                                      <p className="text-xs text-gray-500">{result.subtitle}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-sm text-gray-500">No results found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="hidden sm:block h-6 w-[1px] bg-gray-600" />

              {/* Location Input */}
              <div className="relative w-full sm:w-1/2 flex items-center">
                <div className="flex items-center w-full">
                  <svg className="w-5 sm:w-9 h-5 text-gray-800 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Location, Suburb or postcode"
                    value={locationInput}
                    onChange={(e) => {
                      setLocationInput(e.target.value);
                      if (selectedFilters.location) {
                        setLocation(null);
                      }
                      setActiveDropdown("location");
                    }}
                    onFocus={() => setActiveDropdown("location")}
                    className="w-full outline-none text-gray-700 placeholder-gray-500 bg-transparent text-sm sm:text-base pr-8"
                  />
                  {locationInput && (
                    <button
                      onClick={() => {
                        setLocationInput("");
                        setLocation(null);
                        setLocationResults([]);
                        setActiveDropdown(null);
                      }}
                      className="absolute right-0 text-gray-800 hover:text-orange-500 p-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Location Dropdown */}
                {activeDropdown === "location" && locationInput && (
                  <div className="absolute top-full left-0 right-0 bg-white shadow-xl rounded-lg mt-2 max-h-96 overflow-y-auto z-50 border border-gray-200">
                    {searchLoading ? (
                      <div className="px-4 py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">Searching...</p>
                      </div>
                    ) : locationResults.length > 0 ? (
                      locationResults.map((location, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                          onClick={() => handleLocationSelect(location)}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{location.displayText}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-sm text-gray-500">No locations found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Specialties */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (startIndex > 0) {
                    setStartIndex(startIndex - 1);
                  }
                }}
                disabled={startIndex === 0}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-md flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>

              <div className="flex gap-3 sm:gap-4 md:gap-5">
                {visibleSpecialties.map((specialty: Specialty) => {
                  const isSelected = selectedFilters.specialties.includes(
                    specialty.service_name
                  );

                  return (
                    <button
                      key={specialty.id}
                      onClick={() => setSpecialties([specialty.service_name])}
                      className="flex-shrink-0"
                    >
                      <div
                        className={`
                          relative w-28 h-36 md:w-32 md:h-38
                          rounded-2xl
                          flex flex-col items-center justify-between p-4
                          transition-all duration-300
                          ${isSelected
                            ? "bg-orange-50 border-2 border-orange-500 shadow-xl scale-105"
                            : "bg-white border border-gray-200 shadow-md hover:border-orange-300 hover:shadow-lg scale-100"
                          }
                        `}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-orange-600 rounded-full p-1 shadow-lg z-10">
                            <Check className="w-3 h-3 md:w-4 md:h-4 text-white font-bold" />
                          </div>
                        )}

                        <img
                          src={specialty.image_url?.[0]?.url || "/default-service.png"}
                          alt={specialty.service_name}
                          className="w-14 h-14 md:w-20 md:h-20 object-contain flex-shrink-0"
                        />

                        <span
                          className={`text-xs md:text-sm font-medium text-center leading-snug break-words ${
                            isSelected ? "text-orange-600" : "text-gray-800"
                          }`}
                        >
                          {specialty.service_name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  if (startIndex + cardsPerView < filterOptions.specialties.length) {
                    setStartIndex(startIndex + 1);
                  }
                }}
                disabled={startIndex >= filterOptions.specialties.length - cardsPerView}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-md flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-8 sm:pt-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 md:mb-12">
          <div className="mb-6 md:mb-0">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Discover the top dental clinics we've found for you.
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Expert-reviewed options tailored to your needs
            </p>
          </div>
          <a
            href="#explore"
            className="inline-flex items-center text-orange-600 font-semibold text-lg md:text-xl transition-colors duration-200 group"
          >
            Explore more
            <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Filters + Results */}
      <div className="max-w-7xl mx-auto mt-10 px-4 lg:px-6">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4 sm:mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-between shadow-md hover:bg-orange-700 transition-colors"
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {filtersApplied && (
                <span className="ml-2 bg-white text-orange-600 text-xs px-2 py-1 rounded-full">
                  {selectedFilters.specialties.length +
                    selectedFilters.languages.length +
                    selectedFilters.genders.length +
                    selectedFilters.insurances.length +
                    selectedFilters.days.length +
                    (selectedFilters.service ? 1 : 0) +
                    (selectedFilters.location ? 1 : 0)}
                </span>
              )}
            </span>
            <svg
              className={`w-5 h-5 transform transition-transform ${showFilters ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* LEFT FILTERS */}
          <div
            className={`${showFilters ? "block" : "hidden"} rounded-lg lg:block w-full lg:w-80 lg:sticky lg:top-20 lg:h-fit lg:self-start mb-6 lg:mb-0`}
          >
            <div className="lg:hidden mb-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <Filters
              selectedLanguages={selectedFilters.languages}
              selectedGenders={selectedFilters.genders}
              selectedSpecialties={selectedFilters.specialties}
              selectedInsurances={selectedFilters.insurances}
              selectedAvailableDays={selectedFilters.days}
              onLanguageChange={setLanguages}
              onGenderChange={setGenders}
              onSpecialtyChange={setSpecialties}
              onInsuranceChange={setInsurances}
              onAvailableDaysChange={setDays}
              onClearAll={handleClearAllFilters}
              languages={filterOptions.languages}
              specialties={filterOptions.specialties}
              insuranceOptions={filterOptions.insurances}
              availableDaysOptions={sortedAvailableDaysOptions}
              genderOptions={filterOptions.genders}
            />
          </div>

          {/* RIGHT RESULTS */}
          <div className="flex-1 w-full min-w-0">
            {!showResults && (
              <div className="bg-white p-8 sm:p-12 rounded-lg shadow text-center">
                <svg className="w-16 h-16 text-orange-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <h4 className="text-xl font-semibold text-gray-700 mb-2">
                  Find Your Perfect Clinic
                </h4>
                <p className="text-gray-500">
                  Use the filters on the left or the search bar above to discover dental clinics near you.
                </p>
              </div>
            )}

            {showResults && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-0">
                    {filterLoading
                      ? "Searching..."
                      : `Search Results (${clinics.length} clinic${clinics.length !== 1 ? "s" : ""} found)`}
                  </h3>
                </div>

                {filterLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Finding clinics...</p>
                    </div>
                  </div>
                ) : clinics.length > 0 ? (
                  <div className="grid gap-4 sm:gap-6">
                    {clinics.length > 0 ? (
                      <div className="grid gap-4 sm:gap-6">
                        {clinics.map((clinic: any) => (
                          <div
                            key={clinic.id}
                            className="bg-white border border-gray-200 hover:border-orange-300 hover:ring-orange-500 ring-2 ring-transparent hover:translate-x-1 transition-transform duration-200 rounded-lg shadow-md hover:shadow-lg w-full"
                          >
                            <div className="p-4 sm:p-6">
                              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6 mr-10">
                                {/* Clinic Logo - Fixed */}
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0 mx-auto sm:mx-0 sm:mr-8">
                                  {clinic.logo?.url ? (
                                    <img
                                      src={clinic.logo.url}
                                      alt={clinic.practice_name || "Clinic"}
                                      className="w-full h-full rounded-lg object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/logo-placeholder.png";
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-2xl">
                                      {clinic.practice_name?.charAt(0) || "D"}
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 text-center sm:text-left min-w-0">
                                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                                    {clinic.practice_name || clinic.name || "Unnamed Clinic"}
                                  </h4>

                                  <div className="space-y-3 mb-2">
                                    <p className="flex items-center font-medium text-gray-900 justify-center sm:justify-start">
                                      <svg className="w-4 h-4 mr-2 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      <span className="break-words">
                                        {clinic.address || clinic.practice_address || "Address not available"}
                                        {clinic.city && `, ${clinic.city}`}
                                        {clinic.state && `, ${clinic.state}`}
                                        {clinic.postcode && ` ${clinic.postcode}`}
                                      </span>
                                    </p>

                                    {(clinic.phone || clinic.practice_phone) && (
                                      <p className="flex items-center text-gray-700 justify-center sm:justify-start">
                                        <svg className="w-4 h-4 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {clinic.phone || clinic.practice_phone}
                                      </p>
                                    )}

                                    {clinic.practice_services && clinic.practice_services.length > 0 && (
                                      <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                                        {clinic.practice_services.slice(0, 3).map((service: any) => (
                                          <span
                                            key={service.id}
                                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                                          >
                                            {service.name}
                                          </span>
                                        ))}
                                        {clinic.practice_services.length > 3 && (
                                          <span className="text-xs text-gray-500">
                                            +{clinic.practice_services.length - 3} more
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Availability Section */}
                                  <div className="mt-5">
                                    {loadingMap[clinic.id] ? (
                                      <div className="text-center py-4 text-gray-500">Loading availability...</div>
                                    ) : (
                                      <>
                                        {(availabilityMap[clinic.id] || [])
                                          .slice(0, expandedAvailability[clinic.id] ? 2 : 1)
                                          .map((day: any, index: number) => (
                                            <div key={day.date} className="mb-5">
                                              <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-gray-800">
                                                  {new Date(day.date).toLocaleDateString("en-US", {
                                                    weekday: "short",
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                  })}
                                                </h4>
                                                {(availabilityMap[clinic.id] || []).length > 1 && index === 0 && (
                                                  <button
                                                    onClick={() => {
                                                      setExpandedAvailability((prev) => ({
                                                        ...prev,
                                                        [clinic.id]: !prev[clinic.id],
                                                      }));
                                                    }}
                                                    className="text-orange-600 font-medium text-sm"
                                                  >
                                                    {expandedAvailability[clinic.id] ? "see less" : "+ more"}
                                                  </button>
                                                )}
                                              </div>

                                              <div className="flex flex-wrap gap-3">
                                                {day.slots?.slice(0, 7).map((slot: string) => (
                                                  <button
                                                    key={slot}
                                                    onClick={() => {
                                                      dispatch(resetSelections());
                                                      dispatch(setPatientType('New'));
                                                      dispatch(setSelectedPractice({
                                                        id: clinic.id,
                                                        name: clinic.practice_name || clinic.name || '',
                                                        address: clinic.practice_address || clinic.address || '',
                                                        image: clinic.logo || '',
                                                        date: day.date,
                                                        time: slot,
                                                        fromHomeWidget: true,
                                                      }));
                                                      sessionStorage.setItem("bookingState", JSON.stringify({
                                                        clinicId: clinic.id,
                                                        clinicName: clinic.practice_name,
                                                        clinicAddress: clinic.practice_address,
                                                        clinicImage: clinic.logo || null,
                                                        selectedPractitionerId: null,
                                                        practitionerData: null,
                                                        selectedAppointmentTypeId: null,
                                                        appointmentTypeName: null,
                                                        selectedPatientType: null,
                                                        selectedFamilyMemberId: null,
                                                        selectedDate: day.date,
                                                        selectedTime: slot,
                                                        source: "home",
                                                        fromHomeWidget: true,
                                                        isAuthenticated: false,
                                                      }));
                                                      const reactAppUrl = process.env.NEXT_PUBLIC_REACT_APP_URL || "http://localhost:5173";
                                                      window.location.href = `${reactAppUrl}/booking/${clinic.id}/step-1`;
                                                    }}
                                                    className="border border-orange-300 rounded-full px-3 py-2 text-orange-600 hover:bg-orange-50 text-sm"
                                                  >
                                                    {slot}
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          ))}
                                      </>
                                    )}
                                  </div>

                                  <div className="flex justify-left mt-4">
                                    <Link
                                      href={clinicUrl(clinic)}
                                      onClick={() => window.scrollTo(0, 0)}
                                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 sm:px-6 py-2 rounded-xl transition-colors text-center font-medium text-sm sm:text-base inline-block"
                                    >
                                      View Details
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // No clinics found
                      <div className="bg-white p-6 sm:p-8 lg:p-12 rounded-lg shadow text-center">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h4 className="text-lg sm:text-xl font-medium text-gray-700 mb-2">No clinics found</h4>
                        <p className="text-sm sm:text-base text-gray-500">Try adjusting your filters or search criteria.</p>
                        <button onClick={handleClearAllFilters} className="mt-4 text-orange-600 hover:text-orange-700 font-medium text-sm">
                          Clear all filters
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-6 sm:p-8 lg:p-12 rounded-lg shadow text-center">
                    <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h4 className="text-lg sm:text-xl font-medium text-gray-700 mb-2">
                      No clinics found
                    </h4>
                    <p className="text-sm sm:text-base text-gray-500">
                      Try adjusting your filters or search criteria.
                    </p>
                    <button
                      onClick={handleClearAllFilters}
                      className="mt-4 text-orange-600 hover:text-orange-700 font-medium text-sm"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Other Sections */}
      <div>
        <ServicesSection />
      </div>
      <div>
        <BrowseByState />
      </div>
      <div>
        <ReviewCard />
      </div>
      <div>
        <BlogSection />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}
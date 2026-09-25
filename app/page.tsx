"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { debounce } from "lodash";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  Calendar,
  Clock,
  ShieldCheck,
  Star,
  Stethoscope,
  Smile,
  Sparkles,
  Baby,
  AlertCircle,
  Activity,
  HeartPulse,
  Syringe,
  Users,
  X,
  Check,
} from "lucide-react";

// Components
import Navbar from "@/app/components/layouts/Navbar";
import Footer from "@/app/components/layouts/Footer";
import Filters from "@/app/components/filters/Filters";

// Hooks & APIs
import { usePracticeData } from "@/lib/hooks/usePracticeData";
import { practiceApi } from "@/lib/api/client";
import {
  resetSelections,
  setPatientType,
  setSelectedPractice,
} from "@/lib/store/slices/bookingSlice";

// Types
import type { Specialty, SearchResult, LocationResult } from "@/lib/types";
import { clinicUrl } from "@/lib/slug";
import { clsx } from "clsx";

const WEEK_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const getServiceIcon = (name: string) => {
  const lower = name.toLowerCase();
  const iconClass = "w-6 h-6 text-[#19A7A0]";

  if (lower.includes("emergency")) return <AlertCircle className={iconClass} />;
  if (lower.includes("clean") || lower.includes("check"))
    return <Stethoscope className={iconClass} />;
  if (lower.includes("toothache") || lower.includes("pain"))
    return <Activity className={iconClass} />;
  if (lower.includes("wisdom")) return <Syringe className={iconClass} />;
  if (lower.includes("whiten")) return <Sparkles className={iconClass} />;
  if (lower.includes("implant")) return <ShieldCheck className={iconClass} />;
  if (lower.includes("kid") || lower.includes("child"))
    return <Baby className={iconClass} />;
  if (lower.includes("align") || lower.includes("invisalign"))
    return <Smile className={iconClass} />;
  if (lower.includes("general") || lower.includes("practitioner"))
    return <Stethoscope className={iconClass} />;
  if (lower.includes("oral") || lower.includes("surgery"))
    return <Syringe className={iconClass} />;
  return <HeartPulse className={iconClass} />;
};

export default function HomePage() {
  const dispatch = useDispatch();

  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<
    "service" | "location" | null
  >(null);
  const [serviceInput, setServiceInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [serviceResults, setServiceResults] = useState<SearchResult[]>([]);
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [screenWidth, setScreenWidth] = useState(1024);
  const [startIndex, setStartIndex] = useState(0);
  const [locatingUser, setLocatingUser] = useState(false);

  // ---- Top banner dismissal ----
  const [bannerVisible, setBannerVisible] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("topBannerDismissed");
      if (dismissed === "1") setBannerVisible(false);
    }
  }, []);

  const dismissBanner = () => {
    setBannerVisible(false);
    try {
      localStorage.setItem("topBannerDismissed", "1");
    } catch {
      /* noop */
    }
  };

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

  const [expandedAvailability, setExpandedAvailability] = useState<
    Record<string, boolean>
  >({});
  const [availabilityMap, setAvailabilityMap] = useState<
    Record<string, any[]>
  >({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  // ---------------------------------------------------------------
  // ✅ Availability loader — matches React behavior exactly
  // ---------------------------------------------------------------
  const loadAvailability = async (practiceId: string) => {
    if (availabilityMap[practiceId]) return;

    setLoadingMap((prev) => ({ ...prev, [practiceId]: true }));

    try {
      const data = await practiceApi.getWidgetAvailability(practiceId);
      setAvailabilityMap((prev) => ({
        ...prev,
        [practiceId]: Array.isArray(data)
          ? data
          : (data as { availability?: any[] } | null | undefined)?.availability ?? [],
      }));
    } catch (err) {
      console.error("Availability fetch error:", err);
      setAvailabilityMap((prev) => ({ ...prev, [practiceId]: [] }));
    } finally {
      setLoadingMap((prev) => ({ ...prev, [practiceId]: false }));
    }
  };

  useEffect(() => {
    clinics.forEach((clinic) => {
      loadAvailability(clinic.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinics]);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const closeDropdown = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

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
          console.error("Service search error:", error);
          setServiceResults([]);
        } finally {
          setSearchLoading(false);
        }
      }, 300),
    []
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cityParam = urlParams.get("city");
    const stateParam = urlParams.get("state");
    const postcodeParam = urlParams.get("postcode");

    if (cityParam || stateParam || postcodeParam) {
      const displayParts = [cityParam, stateParam, postcodeParam].filter(
        Boolean
      );
      const displayText = displayParts.join(" ");
      setLocationInput(displayText);
      setLocation({
        displayText,
        city: cityParam || "",
        state: stateParam || "",
        postcode: postcodeParam || "",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          console.error("Location search error:", error);
          setLocationResults([]);
        } finally {
          setSearchLoading(false);
        }
      }, 300),
    []
  );

  useEffect(() => {
    if (serviceInput && !selectedFilters.service) searchServices(serviceInput);
    else if (!serviceInput) setServiceResults([]);
  }, [serviceInput, searchServices, selectedFilters.service]);

  useEffect(() => {
    if (locationInput && !selectedFilters.location)
      searchLocations(locationInput);
    else if (!locationInput) setLocationResults([]);
  }, [locationInput, searchLocations, selectedFilters.location]);

  const handleServiceSelect = (result: SearchResult) => {
    setServiceInput(result.name);
    setServiceResults([]);
    setActiveDropdown(null);
    setService(result);
    if (result.type === "practitioner") {
      sessionStorage.setItem("selectedPractitionerId", result.id);
      if (result.practiceId)
        sessionStorage.setItem("selectedPracticeId", result.practiceId);
    } else {
      sessionStorage.removeItem("selectedPractitionerId");
      sessionStorage.removeItem("selectedPracticeId");
    }
  };

  const handleLocationSelect = (location: LocationResult) => {
    setLocationInput(location.displayText);
    setLocationResults([]);
    setActiveDropdown(null);
    setLocation(location);
  };

  const handleClearAllFilters = () => {
    clearFilters();
    setServiceInput("");
    setLocationInput("");
    setServiceResults([]);
    setLocationResults([]);
    setActiveDropdown(null);
  };

  const hasNoFilters = useMemo(() => {
    return (
      !selectedFilters.service &&
      !selectedFilters.location &&
      selectedFilters.specialties.length === 0 &&
      selectedFilters.languages.length === 0 &&
      selectedFilters.genders.length === 0 &&
      selectedFilters.insurances.length === 0 &&
      selectedFilters.days.length === 0
    );
  }, [selectedFilters]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocatingUser(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();

          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.suburb ||
            data.address?.village ||
            "";
          const state = data.address?.state || "";
          const postcode = data.address?.postcode || "";

          const displayText = [city, state, postcode]
            .filter(Boolean)
            .join(" ");

          setLocationInput(displayText);
          setLocation({ displayText, city, state, postcode });
        } catch (err) {
          console.error("Reverse geocode failed:", err);
          alert("Could not determine your location. Please type it manually.");
        } finally {
          setLocatingUser(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLocatingUser(false);
        alert("Location permission denied or unavailable.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const cardsPerView =
    screenWidth >= 1280
      ? 8
      : screenWidth >= 1024
        ? 6
        : screenWidth >= 768
          ? 4
          : 2;

  const normalizedSpecialties = useMemo<Specialty[]>(() => {
    const raw = (filterOptions?.specialties ?? []) as any[];
    return raw.map((s) => ({
      id: String(s.id),
      service_name: String(s.service_name ?? ""),
      image_url: Array.isArray(s.image_url) ? s.image_url : [],
    }));
  }, [filterOptions?.specialties]);

  const visibleSpecialties = normalizedSpecialties.slice(
    startIndex,
    startIndex + cardsPerView
  );

  const showResults = filtersApplied;

  const sortedAvailableDaysOptions = useMemo(() => {
    if (!filterOptions.availableDays) return WEEK_ORDER;
    return [...filterOptions.availableDays].sort(
      (a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b)
    );
  }, [filterOptions.availableDays]);

  // ---------------------------------------------------------------
  // ✅ Toggle specialty with normalized comparison
  // ---------------------------------------------------------------
  const handleSpecialtyClick = (specialty: Specialty) => {
    const name = specialty.service_name.trim();
    const current = selectedFilters.specialties ?? [];

    const isSelected = current.some(
      (s) => s.trim().toLowerCase() === name.toLowerCase()
    );

    if (isSelected) {
      const next = current.filter(
        (s) => s.trim().toLowerCase() !== name.toLowerCase()
      );
      setSpecialties(next);
    } else {
      setSpecialties([...current, name]);
    }

    window.scrollTo({ top: 600, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#F4FAFA] font-sans">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-4 border-[#19A7A0]" />
          <p className="mt-4 text-lg text-[#163A5F]">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#F4FAFA] font-sans">
        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-md">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h3 className="mb-2 font-clash text-xl font-semibold text-[#163A5F]">
            Something went wrong
          </h3>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-[#FF725E] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e86552] font-sans"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white font-sans">
      {/* ================= HEADER ================= */}
      <Navbar />

      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full overflow-hidden bg-[#F4FAFA]">
        <div className="relative flex min-h-[600px] flex-col lg:min-h-[550px] lg:flex-row">

          {/* Hero Image */}
          <div className="absolute inset-y-0 right-0 z-0 hidden w-1/2 lg:block">
            <img
              src="/assets/homepagebannerfinal.png"
              alt="Dentist with patient"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#F4FAFA] to-transparent" />
          </div>

          {/* Inner content container */}
          <div className="site-container relative z-20 flex w-full items-center py-16 lg:py-0">
            <div className="w-full lg:w-[52%]">
              <div className="w-full max-w-2xl">
                <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-wider text-[#19A7A0]">
                  Better dental care. Closer to you.
                </p>

                <h1 className="mb-4 font-clash text-4xl font-extrabold leading-tight text-[#163A5F] sm:text-5xl lg:text-6xl">
                  Find a trusted dentist near you
                </h1>

                <p className="mb-8 max-w-lg font-sans text-base text-gray-600 sm:text-lg">
                  Search local dental practices, compare options and book an
                  appointment that suits you.
                </p>

                {/* Search Box */}
                <div
                  ref={dropdownRef}
                  className="relative mb-6 flex w-full max-w-2xl flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl sm:flex-row sm:rounded-full"
                >
                  {/* Service */}
                  <div className="relative flex w-full items-center px-4 py-3 sm:w-5/12 sm:py-2">
                    <Search className="mr-2 h-5 w-5 flex-shrink-0 text-gray-400" />

                    <input
                      type="text"
                      placeholder="What do you need?"
                      value={serviceInput}
                      onChange={(e) => {
                        setServiceInput(e.target.value);
                        if (selectedFilters.service) {
                          setService(null);
                        }
                        setActiveDropdown("service");
                      }}
                      onFocus={() => setActiveDropdown("service")}
                      className="w-full bg-transparent font-sans text-sm text-gray-700 outline-none placeholder:text-gray-400"
                    />

                    {serviceInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setServiceInput("");
                          setService(null);
                          setServiceResults([]);
                          setActiveDropdown(null);
                        }}
                        className="absolute right-3 rounded-full bg-[#163A5F] p-1 text-white transition-colors hover:bg-[#0f2a45]"
                        aria-label="Clear service"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}

                    {activeDropdown === "service" && serviceInput && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
                        {searchLoading ? (
                          <div className="px-4 py-8 text-center">
                            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-[#19A7A0]" />
                          </div>
                        ) : serviceResults.length > 0 ? (
                          serviceResults.map((result) => (
                            <div
                              key={result.id}
                              className="cursor-pointer border-b border-gray-100 px-4 py-3 last:border-0 hover:bg-[#F4FAFA]"
                              onClick={() => handleServiceSelect(result)}
                            >
                              <p className="text-sm font-medium text-[#163A5F]">
                                {result.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {result.subtitle}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-sm text-gray-500">
                            No results found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="hidden h-8 w-px bg-gray-200 sm:block" />

                  {/* Location */}
                  <div className="relative flex w-full items-center px-4 py-3 sm:w-5/12 sm:py-2">
                    <MapPin className="mr-2 h-5 w-5 flex-shrink-0 text-gray-400" />

                    <input
                      type="text"
                      placeholder="Where?"
                      value={locationInput}
                      onChange={(e) => {
                        setLocationInput(e.target.value);
                        if (selectedFilters.location) {
                          setLocation(null);
                        }
                        setActiveDropdown("location");
                      }}
                      onFocus={() => setActiveDropdown("location")}
                      className="w-full bg-transparent font-sans text-sm text-gray-700 outline-none placeholder:text-gray-400"
                    />

                    {locationInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setLocationInput("");
                          setLocation(null);
                          setLocationResults([]);
                          setActiveDropdown(null);
                        }}
                        className="absolute right-3 rounded-full bg-[#163A5F] p-1 text-white transition-colors hover:bg-[#0f2a45]"
                        aria-label="Clear location"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}

                    {activeDropdown === "location" && locationInput && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
                        {searchLoading ? (
                          <div className="px-4 py-8 text-center">
                            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-[#19A7A0]" />
                          </div>
                        ) : locationResults.length > 0 ? (
                          locationResults.map((loc, i) => (
                            <div
                              key={i}
                              className="cursor-pointer border-b border-gray-100 px-4 py-3 last:border-0 hover:bg-[#F4FAFA]"
                              onClick={() => handleLocationSelect(loc)}
                            >
                              <p className="text-sm font-medium text-[#163A5F]">
                                {loc.displayText}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-sm text-gray-500">
                            No locations found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => setShowFilters(true)}
                    className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#FF725E] px-6 py-3.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#e86552] sm:w-auto sm:rounded-full sm:py-3"
                  >
                    Find dentists
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Trust Features */}
                <div className="w-full py-3">
                  <div className="flex w-full flex-col gap-6 font-sans text-xs font-medium text-[#163A5F]">
                    {/* Current Location Button */}
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="group flex w-fit cursor-pointer items-center gap-2 rounded-full px-2 py-1.5 text-left font-medium text-[#163A5F] transition-all duration-200 hover:bg-[#E5F7F6] hover:text-[#19A7A0] focus:outline-none focus:ring-2 focus:ring-[#19A7A0]/30 active:scale-[0.98]"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#19A7A0] transition-transform duration-200 group-hover:scale-105">
                        <MapPin className="h-4 w-4 text-white" strokeWidth={2.5} />
                      </span>
                      <span className="whitespace-nowrap">
                        Use my current location
                      </span>
                    </button>

                    {/* Benefits */}
                    <div className="flex w-full flex-wrap items-center gap-6 lg:flex-nowrap lg:justify-between">
                      <span className="flex shrink-0 items-center whitespace-nowrap">
                        <span className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#19A7A0]">
                          <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                        </span>
                        Trusted local practices
                      </span>

                      <span className="flex shrink-0 items-center whitespace-nowrap">
                        <span className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#19A7A0]">
                          <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                        </span>
                        Real-time availability
                      </span>

                      <span className="flex shrink-0 items-center whitespace-nowrap">
                        <span className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#19A7A0]">
                          <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                        </span>
                        Book online, 24/7
                      </span>

                      <span className="flex shrink-0 items-center whitespace-nowrap">
                        <span className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#19A7A0]">
                          <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                        </span>
                        All your dental needs
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= POPULAR SERVICES ================= */}
      <section className="w-full bg-white">
        <div className="site-container py-6">
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-clash text-2xl font-bold text-[#163A5F]">
                Popular dental services
              </h2>
              <p className="mt-1 font-sans text-sm text-gray-500">
                Find the right care for your needs.
              </p>
            </div>
            <Link
              href="#"
              className="font-sans text-sm font-semibold text-[#19A7A0] hover:underline"
            >
              View all services &rarr;
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setStartIndex(Math.max(0, startIndex - 1))}
              disabled={startIndex === 0}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-100 bg-white shadow-md disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5 text-[#163A5F]" />
            </button>

            <div className="w-full overflow-hidden">
              <div
                className="flex gap-4 py-2 transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${startIndex * (100 / cardsPerView)}%)`,
                }}
              >
                {normalizedSpecialties.map((specialty: Specialty) => {
                  const isSelected = (selectedFilters.specialties ?? []).some(
                    (s) =>
                      s.trim().toLowerCase() ===
                      specialty.service_name.trim().toLowerCase()
                  );

                  const imageUrl = specialty.image_url?.[0]?.url;

                  return (
                    <button
                      key={specialty.id}
                      onClick={() => handleSpecialtyClick(specialty)}
                      style={{ width: `calc(${100 / cardsPerView}% - 1rem)` }}
                      aria-pressed={isSelected}
                      className={clsx(
                        "group flex flex-shrink-0 flex-col items-center justify-center rounded-2xl border px-4 py-5 shadow-sm transition-all duration-200",
                        isSelected
                          ? "border-[#19A7A0] bg-[#F4FAFA] ring-2 ring-[#19A7A0]/30 shadow-md"
                          : "border-gray-100 bg-white hover:shadow-md hover:border-[#19A7A0]/40"
                      )}
                    >
                      <div
                        className={clsx(
                          "mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full transition-colors sm:h-20 sm:w-20",
                          isSelected ? "bg-[#5ED6D0]/20" : "bg-gray-50"
                        )}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={specialty.service_name}
                            className="h-full w-full object-contain p-2"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = "none";
                              const fallback =
                                target.nextElementSibling as HTMLElement | null;
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}

                        <div
                          className={clsx(
                            "h-full w-full items-center justify-center",
                            imageUrl ? "hidden" : "flex"
                          )}
                          style={imageUrl ? { display: "none" } : undefined}
                        >
                          {getServiceIcon(specialty.service_name)}
                        </div>
                      </div>

                      <span
                        className={clsx(
                          "text-center font-sans text-xs font-semibold leading-tight sm:text-sm",
                          isSelected ? "text-[#19A7A0]" : "text-[#163A5F]"
                        )}
                      >
                        {specialty.service_name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setStartIndex(startIndex + 1)}
              disabled={
                startIndex + cardsPerView >= normalizedSpecialties.length
              }
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-100 bg-white shadow-md disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5 text-[#163A5F]" />
            </button>
          </div>
        </div>
      </section>

      {/* ================= RESULTS SECTION ================= */}
      <section className="w-full bg-white">
        <div className="site-container mb-12">
          <div className="rounded-3xl bg-[#F4FAFA] px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8 lg:flex-row">
              <div
                className={clsx(
                  "w-full flex-shrink-0 lg:w-72",
                  showFilters || showResults ? "block" : "hidden lg:block"
                )}
              >
                <div className="sticky top-24">
                  <div className="mb-4 flex items-center justify-between lg:hidden">
                    <h3 className="font-clash text-lg font-bold text-[#163A5F]">
                      Filters
                    </h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-gray-500"
                    >
                      ✕
                    </button>
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
                    specialties={normalizedSpecialties}
                    insuranceOptions={filterOptions.insurances}
                    availableDaysOptions={sortedAvailableDaysOptions}
                    genderOptions={filterOptions.genders}
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <h2 className="font-clash text-2xl font-bold text-[#163A5F]">
                      Dentists available near you
                    </h2>
                    <p className="mt-1 font-sans text-sm text-gray-500">
                      Compare clinics, check availability and book online.
                    </p>
                  </div>
                </div>

                {filterLoading && (
                  <div className="flex justify-center py-20">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-4 border-[#19A7A0]" />
                  </div>
                )}

                {!filterLoading && hasNoFilters && clinics.length === 0 && (
                  <div className="rounded-2xl border border-[#E5EEEE] bg-white p-6 shadow-sm">
                    <div className="flex flex-col items-center gap-6 md:flex-row md:items-stretch">
                      <div className="flex flex-1 flex-col justify-center">
                        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#DDF7F5]">
                          <MapPin className="h-6 w-6 text-[#19A7A0]" />
                        </div>
                        <h3 className="mb-2 font-clash text-lg font-bold text-[#163A5F]">
                          Find dentists close to you
                        </h3>
                        <p className="mb-4 font-sans text-sm text-gray-500">
                          Let us use your current location to show the nearest
                          dental practices with real-time availability.
                        </p>
                        <button
                          type="button"
                          onClick={handleUseCurrentLocation}
                          disabled={locatingUser}
                          className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#FF725E] px-5 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#e86552] disabled:cursor-wait disabled:opacity-70"
                        >
                          {locatingUser ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                              Finding location...
                            </>
                          ) : (
                            <>
                              <MapPin className="h-4 w-4" />
                              Use my current location
                            </>
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={locatingUser}
                        className="group relative hidden min-h-[260px] flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-[#5ED6D0]/10 shadow-sm transition-all hover:border-[#19A7A0]/40 hover:shadow-md disabled:cursor-wait md:flex"
                      >
                        <div className="z-10 rounded-lg bg-white p-4 text-center shadow-md transition-transform group-hover:scale-105">
                          {locatingUser ? (
                            <>
                              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-[#19A7A0]" />
                              <p className="font-clash text-sm font-semibold text-[#163A5F]">
                                Finding your
                                <br />
                                location...
                              </p>
                            </>
                          ) : (
                            <>
                              <MapPin className="mx-auto mb-2 h-8 w-8 text-[#19A7A0]" />
                              <p className="font-clash text-sm font-semibold text-[#163A5F]">
                                Local dentists
                                <br />
                                near you
                              </p>
                              <p className="mt-1 font-sans text-[10px] font-medium text-[#19A7A0] group-hover:underline">
                                Click to use my location
                              </p>
                            </>
                          )}
                        </div>
                        <div
                          className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage:
                              "radial-gradient(circle, #19A7A0 1px, transparent 1px)",
                            backgroundSize: "20px 20px",
                          }}
                        />
                      </button>
                    </div>
                  </div>
                )}

                {/* ============ RESULTS LIST (HORIZONTAL CARDS) ============ */}
                {showResults && !filterLoading && clinics.length > 0 && (
                  <div className="grid gap-4 sm:gap-6">
                    {clinics.map((clinic: any) => (
                      <div
                        key={clinic.id}
                        className="bg-white border border-gray-200 hover:border-[#19A7A0]/40 hover:ring-[#19A7A0]/20 ring-2 ring-transparent hover:translate-x-1 transition-transform duration-200 rounded-lg shadow-md hover:shadow-lg w-full cursor-pointer"
                        onClick={() => {
                          window.location.href = clinicUrl(clinic);
                        }}
                      >
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                            
                            {/* Image */}
                            <img
                              src={clinic.logo?.url ?? "/assets/default-service.png"}
                              alt={clinic.practice_name || "Clinic"}
                              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg object-cover mx-auto sm:mx-0 flex-shrink-0"
                            />

                            {/* Content */}
                            <div className="flex-1 text-center sm:text-left min-w-0">
                              <h4 className="text-xl font-clash font-bold text-[#163A5F] mb-2">
                                {clinic.practice_name || "Unnamed Clinic"}
                              </h4>

                              <div className="space-y-3 mb-2">
                                {/* Address */}
                                <p className="flex items-center justify-center sm:justify-start font-sans font-medium text-gray-900">
                                  <MapPin className="w-4 h-4 mr-2 text-[#19A7A0] flex-shrink-0" />
                                  <span className="break-words text-sm">
                                    {clinic.address || "Address not available"}
                                    {clinic.city && `, ${clinic.city}`}
                                    {clinic.state && `, ${clinic.state}`}
                                    {clinic.postcode && ` ${clinic.postcode}`}
                                  </span>
                                </p>

                                {/* Phone */}
                                {clinic.practice_phone && (
                                  <p className="flex items-center justify-center sm:justify-start text-gray-700">
                                    <svg className="w-4 h-4 mr-2 text-[#19A7A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className="text-sm font-sans">{clinic.practice_phone}</span>
                                  </p>
                                )}

                                {/* Services Tags */}
                                {clinic.practice_services && clinic.practice_services.length > 0 && (
                                  <div className="flex flex-wrap justify-center sm:justify-start gap-1">
                                    {clinic.practice_services
                                      .slice(0, 3)
                                      .map((service: any) => (
                                        <span
                                          key={service.id}
                                          className="text-xs bg-[#F4FAFA] text-[#163A5F] font-semibold px-2 py-1 rounded-full"
                                        >
                                          {service.name}
                                        </span>
                                      ))}
                                    {clinic.practice_services.length > 3 && (
                                      <span className="text-xs text-gray-500 self-center">
                                        +{clinic.practice_services.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Availability */}
                              <div className="mt-5">
                                {loadingMap[clinic.id] ? (
                                  <div className="text-center py-4 text-gray-500 font-sans text-sm">
                                    Loading...
                                  </div>
                                ) : (
                                  <>
                                    {(availabilityMap[clinic.id] || [])
                                      .slice(0, expandedAvailability[clinic.id] ? 2 : 1)
                                      .map((day: any, index: number) => (
                                        <div key={day.date} className="mb-5">
                                          <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-sans text-sm font-semibold text-[#163A5F]">
                                              {new Date(day.date).toLocaleDateString("en-US", {
                                                weekday: "short",
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                              })}
                                            </h4>
                                            {(availabilityMap[clinic.id] || []).length > 1 && index === 0 && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setExpandedAvailability((prev) => ({
                                                    ...prev,
                                                    [clinic.id]: !prev[clinic.id],
                                                  }));
                                                }}
                                                className="text-[#FF725E] font-sans text-xs font-semibold hover:underline"
                                              >
                                                {expandedAvailability[clinic.id] ? "see less" : "+ more"}
                                              </button>
                                            )}
                                          </div>

                                          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                                            {day.slots.slice(0, 7).map((slot: string) => (
                                              <button
                                                key={slot}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  dispatch(resetSelections());
                                                  dispatch(setPatientType('New'));
                                                  dispatch(setSelectedPractice({
                                                    id: clinic.id,
                                                    name: clinic.practice_name || '',
                                                    address: clinic.practice_address || '',
                                                    image: clinic.logo || '',
                                                    date: day.date,
                                                    time: slot,
                                                    fromHomeWidget: true,
                                                  }));

                                                  const reactAppUrl = process.env.NEXT_PUBLIC_REACT_APP_URL || "http://localhost:5173";
                                                  const params = new URLSearchParams({
                                                    clinicId: String(clinic.id),
                                                    practiceId: String(clinic.id),
                                                    date: day.date,
                                                    time: slot,
                                                    fromHomeWidget: "true",
                                                    source: "home",
                                                    clinicName: clinic.practice_name || "",
                                                    clinicAddress: clinic.practice_address || "",
                                                    clinicImage: typeof clinic.logo === "string" ? clinic.logo : clinic.logo?.url || "",
                                                  });

                                                  window.location.href = `${reactAppUrl}/booking/${clinic.id}/step-1?${params.toString()}`;
                                                }}
                                                className="border border-[#19A7A0] rounded-full px-3 py-2 text-[#19A7A0] font-sans text-xs font-semibold hover:bg-[#19A7A0] hover:text-white transition-colors"
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

                              {/* View Details Button */}
                              <div className="flex justify-center sm:justify-start mt-4">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = clinicUrl(clinic);
                                  }}
                                  className="bg-[#FF725E] hover:bg-[#e86552] text-white px-4 sm:px-6 py-2 rounded-xl transition-colors font-sans font-semibold text-sm sm:text-base"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="w-full mt-8 bg-[#F3FBFB]">
        <div className="site-container py-12 md:py-16">
          <div className="mb-9">
            <h2 className="font-clash text-2xl font-bold text-[#163A5F] md:text-3xl lg:text-4xl">
              How it works
            </h2>
            <p className="mt-2 font-sans text-sm text-gray-500 md:text-base">
              Book your next dental appointment in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#19A7A0] text-base font-bold text-white">
                1
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Search className="h-5 w-5 text-[#19A7A0]" />
                  <h3 className="font-clash text-base font-bold text-[#163A5F] md:text-lg">
                    Search nearby dentists
                  </h3>
                </div>
                <p className="font-sans text-sm leading-relaxed text-gray-500 md:text-[15px]">
                  Enter your suburb or postcode and what you need.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#19A7A0] text-base font-bold text-white">
                2
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#19A7A0]" />
                  <h3 className="font-clash text-base font-bold text-[#163A5F] md:text-lg">
                    Compare clinics & availability
                  </h3>
                </div>
                <p className="font-sans text-sm leading-relaxed text-gray-500 md:text-[15px]">
                  View services, ratings and real-time appointment times.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#19A7A0] text-base font-bold text-white">
                3
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#19A7A0]" />
                  <h3 className="font-clash text-base font-bold text-[#163A5F] md:text-lg">
                    Book online in minutes
                  </h3>
                </div>
                <p className="font-sans text-sm leading-relaxed text-gray-500 md:text-[15px]">
                  Choose a time that works for you and book instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="w-full bg-white">
        <div className="site-container py-12 md:py-16">
          <div className="mb-9">
            <h2 className="font-clash text-2xl font-bold text-[#163A5F] md:text-3xl lg:text-4xl">
              Dental care, made easier
            </h2>
            <p className="mt-2 font-sans text-sm text-gray-500 md:text-base">
              A simpler way to find and book the right dental care, all in one
              place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <div className="flex items-start gap-4 rounded-xl border border-[#E5EEEE] bg-white px-6 py-5 transition-shadow hover:shadow-sm">
              <div className="flex-shrink-0">
                <Stethoscope className="h-8 w-8 text-[#19A7A0]" />
              </div>
              <div>
                <h3 className="mb-1 font-clash text-base font-bold text-[#163A5F] md:text-lg">
                  Search by treatment
                </h3>
                <p className="font-sans text-sm leading-relaxed text-gray-500 md:text-[15px]">
                  Find the right dentist for your needs, from check-ups to
                  complex treatments.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-[#E5EEEE] bg-white px-6 py-5 transition-shadow hover:shadow-sm">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-[#19A7A0]" />
              </div>
              <div>
                <h3 className="mb-1 font-clash text-base font-bold text-[#163A5F] md:text-lg">
                  See real availability
                </h3>
                <p className="font-sans text-sm leading-relaxed text-gray-500 md:text-[15px]">
                  View up-to-date appointment times across local practices.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-[#E5EEEE] bg-white px-6 py-5 transition-shadow hover:shadow-sm">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-[#19A7A0]" />
              </div>
              <div>
                <h3 className="mb-1 font-clash text-base font-bold text-[#163A5F] md:text-lg">
                  Book 24/7
                </h3>
                <p className="font-sans text-sm leading-relaxed text-gray-500 md:text-[15px]">
                  Find and book appointments anytime, from anywhere.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA BANNER ================= */}
      <section className="w-full bg-white">
        <div className="site-container pb-10 md:pb-12">
          <div className="relative min-h-[220px] overflow-hidden rounded-2xl bg-[#163A5F] md:min-h-[240px]">
            <div className="relative z-20 w-full px-5 py-7 sm:px-6 sm:py-8 md:px-8 md:py-9 lg:w-[65%] lg:px-10">
              <h2 className="max-w-[500px] font-clash text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl lg:text-[34px]">
                Need a dentist today?
              </h2>
              <p className="mt-2 max-w-[650px] font-sans text-xs leading-relaxed text-[#BCEBE8] sm:text-sm md:text-base">
                Find local clinics with same-day availability for urgent dental
                care.
              </p>
              <button
                onClick={() => setShowFilters(true)}
                className="mt-4 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#FF725E] px-4 py-2.5 font-sans text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#ed6653] sm:mt-5 sm:gap-3 sm:px-5 sm:py-3 sm:text-sm md:px-6"
              >
                <span>Find same-day appointments</span>
                <span className="text-lg leading-none sm:text-xl">→</span>
              </button>
            </div>

            <div className="absolute right-4 top-1/2 hidden h-[190px] w-[300px] -translate-y-1/2 md:block md:right-10 md:h-[210px] md:w-[390px] lg:right-8 lg:w-[450px]">
              <div className="absolute right-2 top-3 flex rotate-[20deg] gap-2">
                <span className="block h-8 w-1 rounded-full bg-[#5ED6D0]" />
                <span className="block h-6 w-1 rounded-full bg-[#5ED6D0]" />
                <span className="block h-9 w-1 rounded-full bg-[#5ED6D0]" />
              </div>

              <div className="absolute right-16 top-5 h-[145px] w-[190px] rotate-[-3deg] rounded-xl border-2 border-[#D9F2F1] bg-white shadow-xl md:right-20 md:h-[165px] md:w-[230px]">
                <div className="absolute -top-5 left-7 h-8 w-3 rounded-full border-2 border-[#BDE9E7] bg-transparent" />
                <div className="absolute -top-5 right-7 h-8 w-3 rounded-full border-2 border-[#BDE9E7] bg-transparent" />

                <div className="grid grid-cols-6 gap-2 p-5 pt-7">
                  {Array.from({ length: 18 }).map((_, index) => (
                    <div
                      key={index}
                      className={clsx(
                        "h-6 rounded-md",
                        index === 4 ? "bg-[#19A7A0]" : "bg-[#E7F3F4]"
                      )}
                    >
                      {index === 4 && (
                        <div className="flex h-full items-center justify-center text-xs font-bold text-white">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute left-5 top-[65px] z-20 flex h-16 w-16 items-center justify-center rounded-full bg-[#19C1BA] shadow-lg md:left-8 md:h-20 md:w-20">
                <svg
                  viewBox="0 0 64 64"
                  className="h-8 w-8 fill-current text-white md:h-10 md:w-10"
                >
                  <path d="M20 8C13 8 8 14 8 22C8 31 14 36 16 43C18 50 19 57 24 57C29 57 29 48 32 43C35 48 35 57 40 57C45 57 46 50 48 43C50 36 56 31 56 22C56 14 51 8 44 8C38 8 36 12 32 12C28 12 26 8 20 8Z" />
                </svg>
              </div>

              <div className="absolute bottom-2 right-0 z-30 w-[125px] rotate-[-8deg] rounded-xl bg-white px-4 py-3 shadow-xl md:bottom-0 md:w-[145px]">
                <p className="font-sans text-[11px] font-bold leading-tight text-[#163A5F] md:text-xs">
                  Same-day
                  <br />
                  appointments
                  <br />
                  available
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= GROW PRACTICE ================= */}
      <section className="w-full bg-[#F3FBFB]">
        <div className="site-container overflow-hidden">
          <div className="relative flex min-h-[420px] flex-col items-center lg:flex-row">
            <div className="relative z-20 w-full py-12 lg:w-[58%] lg:py-16">
              <h2 className="font-clash text-2xl font-bold text-[#163A5F] md:text-3xl lg:text-4xl">
                Grow your practice with Local Dentist Near Me
              </h2>
              <p className="mr-5 mt-2 max-w-3xl font-sans text-sm leading-relaxed text-gray-500 md:text-base">
                Join a growing network of dental practices and make it easier
                for new patients to find and book with you.
              </p>

              <div className="mt-8 grid max-w-[760px] grid-cols-2 gap-x-8 gap-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#DDF7F5]">
                    <Search className="h-5 w-5 text-[#19A7A0]" />
                  </div>
                  <span className="font-sans text-sm font-semibold leading-tight text-[#163A5F] md:text-base">
                    Be discovered
                    <br />
                    by local patients
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#DDF7F5]">
                    <Calendar className="h-5 w-5 text-[#19A7A0]" />
                  </div>
                  <span className="font-sans text-sm font-semibold leading-tight text-[#163A5F] md:text-base">
                    Promote available
                    <br />
                    appointments
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#DDF7F5]">
                    <Sparkles className="h-5 w-5 text-[#19A7A0]" />
                  </div>
                  <span className="font-sans text-sm font-semibold leading-tight text-[#163A5F] md:text-base">
                    Showcase services
                    <br />
                    & offers
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#DDF7F5]">
                    <ShieldCheck className="h-5 w-5 text-[#19A7A0]" />
                  </div>
                  <span className="font-sans text-sm font-semibold leading-tight text-[#163A5F] md:text-base">
                    Receive online
                    <br />
                    booking enquiries
                  </span>
                </div>
              </div>

              <button className="mt-8 inline-flex items-center gap-3 rounded-lg bg-[#FF725E] px-7 py-3.5 font-sans text-base font-semibold text-white transition-all duration-200 hover:bg-[#ed6653]">
                <span>List your practice</span>
                <span className="text-xl leading-none">→</span>
              </button>
            </div>

            <div className="relative h-[300px] w-full lg:absolute lg:bottom-[-5px] lg:right-0 lg:h-[370px] lg:w-[47%]">
              <div className="absolute bottom-[-30px] right-0 h-[330px] w-full max-w-[570px] rounded-[22px] bg-[#12283A] p-2 shadow-2xl">
                <div className="relative h-full w-full overflow-hidden rounded-[15px] bg-white">
                  <div className="absolute bottom-0 left-0 top-0 w-[125px] border-r border-[#E4EEEE] bg-[#F2FAFA] p-4">
                    <div className="mb-6 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#19A7A0] text-white">
                        <span className="text-xs">♥</span>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold leading-none text-[#163A5F]">
                          Local Dentist
                        </p>
                        <p className="text-[8px] font-bold leading-none text-[#163A5F]">
                          Near Me
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 rounded-lg bg-[#DDF7F5] px-2 py-2 text-[#19A7A0]">
                        <Search className="h-3 w-3" />
                        <span className="text-[8px] font-semibold">
                          Overview
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-2 text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span className="text-[8px]">Appointments</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-2 text-gray-500">
                        <Users className="h-3 w-3" />
                        <span className="text-[8px]">Patients</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-2 text-gray-500">
                        <Stethoscope className="h-3 w-3" />
                        <span className="text-[8px]">Services</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-2 text-gray-500">
                        <ShieldCheck className="h-3 w-3" />
                        <span className="text-[8px]">Settings</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-2 text-gray-500">
                        <span className="text-[11px]">⌖</span>
                        <span className="text-[8px]">Center Locations</span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-[125px] p-5">
                    <div className="mb-4">
                      <p className="font-sans text-[9px] text-gray-400">
                        Welcome back,
                      </p>
                      <h3 className="font-clash text-base font-bold text-[#163A5F]">
                        Riverside Dental
                      </h3>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg border border-[#E7EEEE] px-3 py-3">
                        <p className="font-clash text-xl font-bold text-[#163A5F]">
                          124
                        </p>
                        <p className="text-[7px] text-gray-400">
                          New patients
                        </p>
                      </div>
                      <div className="rounded-lg border border-[#E7EEEE] px-3 py-3">
                        <p className="font-clash text-xl font-bold text-[#163A5F]">
                          48
                        </p>
                        <p className="text-[7px] text-gray-400">
                          Bookings this month
                        </p>
                      </div>
                      <div className="rounded-lg border border-[#E7EEEE] px-3 py-3">
                        <p className="font-clash text-xl font-bold text-[#163A5F]">
                          4.8
                        </p>
                        <p className="text-[7px] text-gray-400">
                          Average rating
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex h-[135px] items-end gap-3 rounded-xl border border-[#E7EEEE] p-4">
                      {[35, 25, 20, 30, 52, 45, 68, 50, 58, 40, 55, 72].map(
                        (height, index) => (
                          <div
                            key={index}
                            className="min-w-[8px] flex-1 rounded-t bg-[#19C1BA]"
                            style={{ height: `${height}%` }}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute right-0 top-[35px] z-30 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-xl">
                <div className="flex h-7 items-end gap-1">
                  <span className="h-3 w-1.5 rounded-sm bg-[#19A7A0]" />
                  <span className="h-5 w-1.5 rounded-sm bg-[#19A7A0]" />
                  <span className="h-7 w-1.5 rounded-sm bg-[#19A7A0]" />
                </div>
                <div>
                  <p className="font-clash text-xs font-bold text-[#163A5F]">
                    More patients
                  </p>
                  <p className="font-sans text-[9px] text-gray-500">
                    & healthier community
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
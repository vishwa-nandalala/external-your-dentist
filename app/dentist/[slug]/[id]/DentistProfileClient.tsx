"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/layouts/Navbar";
import Footer from "@/app/components/layouts/Footer";
import AvailableSlots from "@/app/components/booking/AvailableSlots";
import { practiceApi } from "@/lib/api/client";
import type { PractitionerProfile, PracticeOpeningHourDetail, ClinicAppointmentType } from "@/lib/types";

const BANNER_FALLBACK = "/hero.webp";

const WEEK_ORDER = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
];

const SIDEBAR_LINKS = [
  { id: "overview", label: "Overview", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "practitioner-information", label: "Practitioner Information", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { id: "practice-information", label: "Practice Information", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
];

function formatTime(time: string): string {
  if (!time) return "";
  const parts = time.split(":");
  if (parts.length < 2) return time;
  let hours = parseInt(parts[0]);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

function formatOpeningHours(
  hours: PracticeOpeningHourDetail[]
): { day: string; time: string; isClosed: boolean }[] {
  return WEEK_ORDER.map((day) => {
    const dayHours = hours.find(
      (h) => h.day_of_week.toLowerCase() === day.toLowerCase()
    );
    if (dayHours && dayHours.is_open) {
      if (dayHours.time_slots && dayHours.time_slots.length > 0) {
        const slots = dayHours.time_slots
          .map((s) => `${formatTime(s.start)} - ${formatTime(s.end)}`)
          .join(", ");
        return { day, time: slots, isClosed: false };
      }
      return { day, time: "Open", isClosed: false };
    }
    return { day, time: "Closed", isClosed: true };
  });
}

function getLanguages(languages: any[] | null): string[] {
  if (!languages) return ["English"];
  if (!Array.isArray(languages)) return ["English"];
  return languages.map((lang: any) => {
    if (typeof lang === "string") return lang;
    if (lang?.name) return lang.name;
    return "Unknown";
  });
}

export default function DentistProfileClient({ practitioner }: { practitioner: PractitionerProfile }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("overview");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // --- Booking state (mirrors React useBooking) ---
  const practiceId = practitioner.practice_info?.id ?? "";
  const [bookingAppointmentTypes, setBookingAppointmentTypes] = useState<ClinicAppointmentType[]>([]);
  const [selectedAppointmentType, setSelectedAppointmentType] = useState("");
  const [availability, setAvailability] = useState<{ date: string; dateStr: string; slots: string[] }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showSlotsModal, setShowSlotsModal] = useState(false);

  // Step 1: Fetch appointment types from booking API (same as useBooking.fetchAppointmentTypes)
  useEffect(() => {
    if (!practiceId) return;
    practiceApi.getBookingAppointmentTypes(practiceId)
      .then((types) => {
        setBookingAppointmentTypes(types);
        // Auto-select first appointment type (same as useBooking does)
        if (types.length > 0 && !selectedAppointmentType) {
          setSelectedAppointmentType(types[0].id);
        }
      })
      .catch(() => setBookingAppointmentTypes([]));
  }, [practiceId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fallback: if booking API types are empty, use practitioner's own types (for the dropdown)
  // This matches React: it falls back to practitioner.practitioner_appointment_types
  const effectiveAppointmentTypes = bookingAppointmentTypes.length > 0
    ? bookingAppointmentTypes
    : (practitioner.practitioner_appointment_types ?? []).map((t) => t.appointment_type);

  // Deduplicate by id (same as React dropdown)
  const dedupedTypes = Array.from(
    new Map(effectiveAppointmentTypes.map((t) => [t.id, t])).values()
  );

  // If selectedAppointmentType is still empty after types load, set it
  useEffect(() => {
    if (!selectedAppointmentType && dedupedTypes.length > 0) {
      setSelectedAppointmentType(dedupedTypes[0].id);
    }
  }, [selectedAppointmentType, dedupedTypes]);

  // Step 2: Fetch availability when appointment type changes (same as useBooking.fetchAvailability)
  useEffect(() => {
    if (!practiceId || !selectedAppointmentType) {
      setAvailability([]);
      return;
    }
    setSlotsLoading(true);
    practiceApi.getBookingAvailability(practiceId, practitioner.id, selectedAppointmentType)
      .then((data) => setAvailability(data.slice(0, 2)))
      .catch(() => setAvailability([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedAppointmentType, practiceId, practitioner.id]);

  // Handle appointment type dropdown change (same as useBooking.handleAppointmentTypeChange)
  const handleAppointmentTypeChange = (appointmentTypeId: string) => {
    setSelectedAppointmentType(appointmentTypeId);
  };

  const bookingClinicData = {
    id: practiceId,
    practice_name: practitioner.practice_info?.practice_name ?? null,
    appointment_types: effectiveAppointmentTypes,
    practice_team_members: [
      {
        id: practitioner.id,
        first_name: practitioner.first_name,
        last_name: practitioner.last_name,
        qualification: practitioner.qualification,
        gender: practitioner.gender,
        languages: practitioner.languages,
        image: practitioner.image ?? null,
        practitioner_appointment_types: practitioner.practitioner_appointment_types,
      },
    ],
  };

  const handleBookSlot = (date: string, time: string) => {
    const practiceAppointmentType = effectiveAppointmentTypes.find(
      (a) => a.id === selectedAppointmentType
    );
    const saved = sessionStorage.getItem("bookingState");
    const parsed = saved ? JSON.parse(saved) : {};
    sessionStorage.setItem("bookingState", JSON.stringify({
      ...parsed,
      selectedDate: date,
      selectedDateStr: date,
      selectedTime: time,
      selectedPractitionerId: practitioner.id,
      selectedPractitioner: practitioner.id,
      selectedAppointmentTypeId: selectedAppointmentType,
      clinicId: practiceId,
      clinicName: practitioner.practice_info?.practice_name,
      practitionerData: {
        id: practitioner.id,
        first_name: practitioner.first_name,
        last_name: practitioner.last_name,
        image: practitioner.image ?? null,
      },
      appointmentTypeName: practiceAppointmentType?.name,
      clinic: bookingClinicData,
      fromHomeWidget: false,
    }));
    const reactAppUrl = process.env.NEXT_PUBLIC_REACT_APP_URL || "http://localhost:5173";
    window.location.href = `${reactAppUrl}/booking/${practiceId}/step-1`;
  };

  const fullName = `${practitioner.first_name} ${practitioner.last_name || ""}`.trim();
  const practitionerImage = practitioner.image?.url;
  const practiceBanner = practitioner.practice_info?.banner_image?.url;
  const openingHours = formatOpeningHours(practitioner.practice_info?.practice_opening_hours || []);
  const languages = getLanguages(practitioner.languages);
  const baseInfo = practitioner.practice_info?.practice_base_info;
  const services = practitioner.practitioner_practice_services || [];

  const scrollToSection = useCallback((sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      setActiveSection(sectionId);
    }
  }, []);

  useEffect(() => {
    const updateActiveSection = () => {
      const scrollPosition = window.scrollY + 150;
      for (const section of SIDEBAR_LINKS) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", updateActiveSection);
    updateActiveSection();
    return () => window.removeEventListener("scroll", updateActiveSection);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Banner */}
      <section
        id="overview"
        ref={(el) => { sectionRefs.current["overview"] = el; }}
        className="scroll-mt-36"
      >
        <div className="relative h-56 sm:h-64 md:h-80 w-full overflow-visible">
          <img
            src={practiceBanner || BANNER_FALLBACK}
            alt="Clinic Banner"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 lg:bottom-10 left-0 w-full px-4 sm:px-6 md:px-8 lg:px-16">
            <div className="max-w-7xl mx-auto flex justify-start">
              <div className="bg-black/60 backdrop-blur-sm px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 rounded-xl shadow-2xl w-full sm:w-auto sm:max-w-2xl">
                <div className="flex flex-col items-start gap-3">
                  <div className="flex items-start gap-2">
                    {practitionerImage ? (
                      <img
                        src={practitionerImage}
                        alt={fullName}
                        className="w-20 h-20 rounded-full object-cover border-2 border-white flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-2xl border-2 border-white flex-shrink-0">
                        {practitioner.first_name?.charAt(0)}
                      </div>
                    )}

                    <div className="flex flex-col">
                      <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                        {fullName}
                      </h1>

                      <p className="text-sm md:text-base text-gray-200 mt-1 flex items-center flex-wrap gap-1">
                        {services.slice(0, 3).map((service, index) => (
                          <span key={index} className="inline-flex items-center">
                            <span className="text-gray-200">{service.practice_service.name}</span>
                            {index < Math.min(2, (services.slice(0, 3).length) - 1) && (
                              <span className="mx-1 text-gray-400">&bull;</span>
                            )}
                          </span>
                        ))}
                        {services.length > 3 && (
                          <span className="inline-flex items-center gap-1 text-yellow-300 text-xs font-medium ml-1">
                            +{services.length - 3} more
                          </span>
                        )}
                        {services.length === 0 && (
                          <span className="text-gray-300 italic">Dental Services</span>
                        )}
                      </p>

                      {practitioner.is_visible_online && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full bg-green-600 text-white text-xs font-semibold shadow-sm w-fit">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const referrer = sessionStorage.getItem("dentistFromClinic");
              if (referrer) {
                sessionStorage.removeItem("dentistFromClinic");
                window.location.href = referrer;
              } else if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                // Fall back to React app home (Next.js pages are SEO-only mirrors)
                const reactAppUrl = process.env.NEXT_PUBLIC_REACT_APP_URL || "http://localhost:5173";
                window.location.href = reactAppUrl;
              }
            }}
            className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-4 bg-gray-100 backdrop-blur-sm hover:bg-white text-gray-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-md transition-all flex items-center gap-2 text-xs sm:text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back</span>
          </button>
        </div>
      </section>

      {/* Quick Links */}
      <div className="bg-white sticky top-12 md:top-16 z-40 shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-5 lg:px-7">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-orange-100">
            <nav className="flex gap-1.5 sm:gap-2 py-2 sm:py-3 min-w-max">
              {SIDEBAR_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm whitespace-nowrap transition-all font-medium ${
                    activeSection === link.id
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-600"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                  </svg>
                  <span>{link.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-5 lg:px-7 py-4 sm:py-6 md:py-7">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-5">
          {/* Booking Widget */}
          <aside className="w-full lg:w-80 flex-shrink-0 order-first lg:order-last mb-6 lg:mb-0">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-fit lg:sticky lg:top-36">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                  Book appointment
                </h3>
              </div>
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                    Show times for
                  </label>
                  <select
                    value={selectedAppointmentType}
                    onChange={(e) => handleAppointmentTypeChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  >
                    {dedupedTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                    {dedupedTypes.length === 0 && (
                      <option value="" disabled>No appointment types</option>
                    )}
                  </select>
                </div>

                {/* Time slots - always rendered like React */}
                {selectedAppointmentType && (
                  <div className="space-y-5 mt-5">
                    {slotsLoading ? (
                      <div className="text-center py-4 text-gray-500">Loading slots...</div>
                    ) : availability.length > 0 ? (
                      availability.map((day) => (
                        <div key={day.date}>
                          <h4 className="font-semibold text-gray-800 mb-3">
                            {new Date(day.date).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {day.slots.slice(0, 5).map((slot) => (
                              <button
                                key={slot}
                                onClick={() => handleBookSlot(day.date, slot)}
                                className="bg-gray-100 hover:bg-orange-100 text-orange-600 rounded-full py-2 px-2 text-sm"
                              >
                                {slot}
                              </button>
                            ))}
                            {day.slots.length > 5 && (
                              <button
                                onClick={() => setShowSlotsModal(true)}
                                className="bg-gray-100 hover:bg-orange-100 text-orange-600 rounded-full py-2 px-2 text-sm"
                              >
                                Show all
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4">No slots available</div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setShowSlotsModal(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-full transition-all shadow-md text-sm sm:text-base"
                >
                  See all appointments
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 order-last lg:order-first">
            <div className="bg-white p-4 sm:p-6 md:p-8 lg:p-10 rounded-lg sm:rounded-2xl shadow-sm border border-gray-100">
              <main className="space-y-6 sm:space-y-8 md:space-y-10">

                {/* Overview */}
                <section
                  id="overview"
                  ref={(el) => { sectionRefs.current["overview"] = el; }}
                  className="scroll-mt-24"
                >
                  <div className="mb-4 sm:mb-6 border-b-4 border-orange-400">
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Overview
                    </h2>
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {practitioner.professional_statement || `${fullName} is a dedicated dental professional committed to providing quality care.`}
                    </p>
                  </div>
                </section>

                {/* Practitioner Information */}
                <section
                  id="practitioner-information"
                  ref={(el) => { sectionRefs.current["practitioner-information"] = el; }}
                  className="scroll-mt-24"
                >
                  <div className="mb-4 sm:mb-6 border-b-4 border-orange-400">
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Practitioner Information
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="pl-2 sm:pl-3">
                      <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        Languages Spoken
                      </h4>
                      <ul className="space-y-1.5 sm:space-y-2 pl-4 sm:pl-6">
                        {languages.map((lang, index) => (
                          <li key={index} className="text-sm sm:text-base text-gray-700">
                            {lang}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pl-2 sm:pl-3">
                      <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Services
                      </h4>
                      <ul className="space-y-1.5 sm:space-y-2 pl-4 sm:pl-6">
                        {services.map((service) => (
                          <li key={service.practice_service_id} className="text-sm sm:text-base text-gray-700">
                            {service.practice_service.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {(practitioner.education || practitioner.ahpra_number) && (
                    <div className="mt-6 sm:mt-8 pl-2 sm:pl-3">
                      <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                        Education & Credentials
                      </h4>
                      <div className="space-y-2 pl-4 sm:pl-6">
                        {practitioner.education && (
                          <p className="text-sm sm:text-base text-gray-700">{practitioner.education}</p>
                        )}
                        {practitioner.ahpra_number && (
                          <p className="text-sm sm:text-base text-gray-600">
                            AHPRA Number: <span className="font-mono font-semibold">{practitioner.ahpra_number}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </section>

                {/* Practice Information */}
                <section
                  id="practice-information"
                  ref={(el) => { sectionRefs.current["practice-information"] = el; }}
                  className="scroll-mt-24"
                >
                  <div className="mb-4 sm:mb-6 border-b-4 border-orange-400">
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Practice Information
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="pl-2 sm:pl-3 space-y-3 sm:space-y-4">
                      <div>
                        <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Address
                        </h4>
                        <p className="pl-4 sm:pl-6 text-sm sm:text-base text-gray-700 leading-relaxed">
                          {practitioner.practice_info?.address}
                          <br />
                          {practitioner.practice_info?.city}, {practitioner.practice_info?.state} {practitioner.practice_info?.postcode}
                        </p>
                      </div>

                      {baseInfo?.website && (
                        <div>
                          <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            Website
                          </h4>
                          <a
                            href={baseInfo.website}
                            target="_blank"
                            rel="noreferrer"
                            className="pl-4 sm:pl-6 text-blue-600 hover:underline break-all text-sm sm:text-base"
                          >
                            {baseInfo.website}
                          </a>
                        </div>
                      )}

                      {practitioner.practice_info?.practice_phone && (
                        <div>
                          <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Phone
                          </h4>
                          <a
                            href={`tel:${practitioner.practice_info.practice_phone}`}
                            className="pl-4 sm:pl-6 text-gray-700 hover:text-orange-600 transition-colors text-sm sm:text-base"
                          >
                            {practitioner.practice_info.practice_phone}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="pl-2 sm:pl-3">
                      <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Opening Hours
                      </h4>
                      <div className="space-y-1.5 sm:space-y-2 pl-4 sm:pl-5">
                        {openingHours.map(({ day, time, isClosed }) => (
                          <div
                            key={day}
                            className={`flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm ${
                              isClosed ? "text-red-500" : "text-gray-700"
                            }`}
                          >
                            <span className="font-medium">{day}</span>
                            <span className={isClosed ? "font-semibold" : ""}>{time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

              </main>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {showSlotsModal && (
        <AvailableSlots
          isOpen={showSlotsModal}
          onClose={() => setShowSlotsModal(false)}
          clinic={{
            id: practiceId,
            practice_name: practitioner.practice_info?.practice_name ?? null,
            address: practitioner.practice_info?.address ?? null,
            city: practitioner.practice_info?.city ?? null,
            state: practitioner.practice_info?.state ?? null,
            postcode: practitioner.practice_info?.postcode ?? null,
            description: practitioner.professional_statement ?? null,
            logo: practitioner.practice_info?.logo ?? null,
            banner_image: practitioner.practice_info?.banner_image ?? null,
            email: practitioner.practice_info?.email ?? null,
            practice_phone: practitioner.practice_info?.practice_phone ?? null,
            status: practitioner.practice_info?.status ?? null,
            practice_base_info: practitioner.practice_info?.practice_base_info ?? null,
            practice_opening_hours: practitioner.practice_info?.practice_opening_hours ?? [],
            practice_facilities: [],
            practice_team_members: [
              {
                id: practitioner.id,
                first_name: practitioner.first_name,
                last_name: practitioner.last_name,
                qualification: practitioner.qualification,
                gender: practitioner.gender,
                languages: practitioner.languages,
                image: practitioner.image ?? null,
                practitioner_appointment_types: practitioner.practitioner_appointment_types,
              },
            ],
            practice_services: [],
            practice_insurances: [],
            practice_galleries: [],
            practice_achievements: [],
            practice_certifications: [],
            appointment_types: effectiveAppointmentTypes,
          } as any}
          selectedDentistId={practitioner.id}
        />
      )}
    </div>
  );
}

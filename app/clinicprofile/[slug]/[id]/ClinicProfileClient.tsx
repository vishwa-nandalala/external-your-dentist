"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/layouts/Navbar";
import Footer from "@/app/components/layouts/Footer";
import AvailableSlots from "@/app/components/booking/AvailableSlots";
import { practiceApi } from "@/lib/api/client";
import { clinicUrl, dentistUrl } from "@/lib/slug";
import type {
  ClinicProfile,
  PracticeTeamMemberDetail,
  PracticeOpeningHourDetail,
  ClinicAppointmentType,
} from "@/lib/types";

const BANNER_FALLBACK = "/hero.webp";

const WEEK_ORDER = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
];

const SIDEBAR_LINKS = [
  { id: "basic-info", label: "Basic Info", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "services", label: "Services", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { id: "team", label: "Team", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { id: "gallery", label: "Gallery", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { id: "achievements", label: "Achievements", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
  { id: "certifications", label: "Certifications", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
  { id: "insurances", label: "Insurances", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { id: "facilities", label: "Facilities", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { id: "contact", label: "Contact Us", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
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

const TeamMemberCard = ({
  member,
  clinic,
}: {
  member: PracticeTeamMemberDetail;
  clinic: ClinicProfile;
}) => {
  const handleClick = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("dentistFromClinic", clinicUrl(clinic));
    }
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm h-full flex flex-col">
      <div className="pt-8 flex justify-center">
        {member.image?.url ? (
          <img
            src={member.image.url}
            alt={`${member.first_name} ${member.last_name}`}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow"
          />
        ) : (
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-2xl shadow">
            {member.first_name?.charAt(0) || "D"}
          </div>
        )}
      </div>
      <div className="flex-1 px-4 sm:px-6 pt-6 text-center">
        <h4 className="font-bold text-base sm:text-lg text-gray-900">
          {member.first_name} {member.last_name || ""}
        </h4>
        <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
          {member.qualification || "Dental Practitioner"}
        </p>
      </div>
      <div className="pb-6 pt-4 flex justify-center gap-4">
        <Link
          href={dentistUrl({ id: member.id, first_name: member.first_name, last_name: member.last_name })}
          onClick={handleClick}
          className="px-4 sm:px-6 py-2 rounded-full border border-gray-300 text-gray-700 text-xs sm:text-sm font-semibold hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 bg-white"
        >
          Profile
        </Link>
      </div>
    </div>
  );
};

export default function ClinicProfileClient({ clinic }: { clinic: ClinicProfile }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("basic-info");
  const [currentSlide, setCurrentSlide] = useState(0);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const isVerified = clinic.status === "ACTIVE";
  const hasAppointments = !!clinic.appointment_types?.length;

  // Auto-select first appointment type on mount
  const [selectedAppointmentType, setSelectedAppointmentType] = useState(() => {
    if (clinic?.appointment_types?.length) return clinic.appointment_types[0].id;
    return "";
  });
  const [selectedPractitionerId, setSelectedPractitionerId] = useState("");
  const [practitioners, setPractitioners] = useState<{ id: string; first_name: string; last_name: string; image: any }[]>([]);
  const [availability, setAvailability] = useState<{ date: string; dateStr: string; slots: string[] }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showSlotsModal, setShowSlotsModal] = useState(false);

  useEffect(() => {
    if (!selectedAppointmentType || !clinic?.id) {
      setPractitioners([]);
      setAvailability([]);
      return;
    }
    practiceApi.getBookingPractitioners(clinic.id, selectedAppointmentType).then((data) => {
      setPractitioners(data);
      // Auto-select first practitioner: try clinic team member first, then first from API
      if (data.length > 0) {
        const firstMemberId = clinic.practice_team_members?.[0]?.id;
        if (firstMemberId && data.some((p) => p.id === firstMemberId)) {
          setSelectedPractitionerId(firstMemberId);
        } else {
          setSelectedPractitionerId(data[0].id);
        }
      } else {
        setSelectedPractitionerId("");
      }
      setAvailability([]);
    }).catch(() => {
      setPractitioners([]);
    });
  }, [selectedAppointmentType, clinic?.id]);

  useEffect(() => {
    if (!selectedPractitionerId || !selectedAppointmentType || !clinic?.id) {
      setAvailability([]);
      return;
    }
    setSlotsLoading(true);
    practiceApi.getBookingAvailability(clinic.id, selectedPractitionerId, selectedAppointmentType)
      .then((data) => setAvailability(data.slice(0, 2)))
      .catch(() => setAvailability([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedPractitionerId, selectedAppointmentType, clinic?.id]);

  useEffect(() => {
    if (!selectedPractitionerId || !practitioners.length) return;
    if (!practitioners.some((p) => p.id === selectedPractitionerId)) {
      setSelectedPractitionerId("");
    }
  }, [practitioners, selectedPractitionerId]);

  const handleBookSlot = (date: string, time: string) => {
    const practitioner = clinic.practice_team_members?.find((p) => p.id === selectedPractitionerId);
    const appointmentType = clinic.appointment_types?.find((a) => a.id === selectedAppointmentType);
    const saved = sessionStorage.getItem("bookingState");
    const parsed = saved ? JSON.parse(saved) : {};
    sessionStorage.setItem("bookingState", JSON.stringify({
      ...parsed,
      clinicId: clinic.id,
      clinicName: clinic.practice_name,
      selectedAppointmentTypeId: selectedAppointmentType,
      selectedAppointmentTypeName: appointmentType?.name,
      selectedAppointmentTypeDuration: null,
      selectedPractitioner: selectedPractitionerId,
      selectedPractitionerId,
      practitionerAppointmentTypes: practitioner?.practitioner_appointment_types ?? [],
      practitionerData: practitioner ? {
        id: practitioner.id,
        first_name: practitioner.first_name,
        last_name: practitioner.last_name,
        image: practitioner.image ?? null,
      } : null,
      selectedPatientType: null,
      selectedFamilyMemberId: null,
      selectedDate: date,
      selectedDateStr: date,
      selectedTime: time,
      fromHomeWidget: false,
      clinic,
      source: "clinic",
      isAuthenticated: false,
    }));
    const reactAppUrl = process.env.NEXT_PUBLIC_REACT_APP_URL || "http://localhost:5173";
    window.location.href = `${reactAppUrl}/booking/${clinic.id}/step-1`;
  };

  const galleryImages = useMemo(() => {
    if (!clinic.practice_galleries?.length) return [];
    return clinic.practice_galleries
      .map((img) => img.image_url?.url)
      .filter((url): url is string => Boolean(url));
  }, [clinic.practice_galleries]);

  const availableLinks = useMemo(() => {
    return SIDEBAR_LINKS.filter((link) => {
      switch (link.id) {
        case "basic-info":
        case "contact":
          return true;
        case "services":
          return !!clinic.practice_services?.length;
        case "team":
          return !!clinic.practice_team_members?.length;
        case "gallery":
          return galleryImages.length > 0;
        case "achievements":
          return !!clinic.practice_achievements?.length;
        case "certifications":
          return !!clinic.practice_certifications?.length;
        case "insurances":
          return !!clinic.practice_insurances?.length;
        case "facilities":
          return !!clinic.practice_facilities?.length;
        default:
          return true;
      }
    });
  }, [clinic, galleryImages]);

  useEffect(() => {
    if (galleryImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [galleryImages.length]);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(sectionId);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250;
      for (const link of availableLinks) {
        const element = sectionRefs.current[link.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(link.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [availableLinks]);

  const openingHours = formatOpeningHours(clinic.practice_opening_hours || []);
  const clinicLogo = clinic.logo?.url;
  const clinicBanner = clinic.banner_image?.url;
  const baseInfo = clinic.practice_base_info;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Banner */}
      <section
        id="basic-info"
        ref={(el) => { sectionRefs.current["basic-info"] = el; }}
        className="scroll-mt-36"
      >
        <div className="relative h-56 sm:h-64 md:h-80 w-full overflow-visible">
          <img
            src={clinicBanner || BANNER_FALLBACK}
            alt="Clinic Banner"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/40 to-transparent" />

          <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 lg:bottom-10 left-0 w-full px-4 sm:px-6 md:px-8 lg:px-16">
            <div className="max-w-7xl mx-auto flex justify-start">
              <div className="bg-black/60 backdrop-blur-sm px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 rounded-xl shadow-2xl w-full sm:w-auto sm:max-w-2xl">                    <div className="flex flex-col items-start gap-3">
                      <div className="flex items-start gap-2">
                        {clinicLogo ? (
                          <img
                            src={clinicLogo}
                            alt={clinic.practice_name || "Clinic"}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xl border-2 border-white flex-shrink-0">
                            {clinic.practice_name?.charAt(0) || "C"}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                              {clinic.practice_name || "Clinic Name"}
                            </h1>
                            {!isVerified && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-400/90 text-yellow-900">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                Not Verified
                              </span>
                            )}
                            {isVerified && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-400/90 text-green-900">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-sm md:text-base text-gray-200 mt-1">
                            {[clinic.city, clinic.state, clinic.postcode]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
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
      <div className="bg-white justify-center items-center sticky top-12 md:top-16 z-40 shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-5 lg:px-7">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-orange-100 hover:scrollbar-thumb-orange-500 scroll-smooth">
            <nav className="flex flex-row gap-1.5 sm:gap-2 py-2 sm:py-3 min-w-max">
              {availableLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm whitespace-nowrap transition-all duration-200 font-medium ${
                    activeSection === link.id
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-600 hover:shadow-md"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                  </svg>
                  <span className="hidden sm:inline">{link.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-5 lg:px-7 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-5">
          {/* Main Content Area */}
          <div className="flex-1 order-last lg:order-first">
            <div className="bg-white p-4 sm:p-6 md:p-10 rounded-lg sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <main className="flex-1 min-w-0 space-y-6 sm:space-y-8 md:space-y-10">

                {/* Basic Info */}
                <section>
                  <div className="flex items-center justify-between mb-6 border-b-4 border-orange-400">
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Basic Info
                    </h2>
                  </div>
                  <div className="bg-white p-2 sm:p-3 md:p-4">
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {clinic.description || "No description available."}
                    </p>
                  </div>
                </section>

                {/* Services */}
                {clinic.practice_services?.length > 0 && (
                  <section
                    id="services"
                    ref={(el) => { sectionRefs.current["services"] = el; }}
                    className="scroll-mt-36"
                  >
                    <div className="flex items-center justify-between mb-6 border-b-4 border-orange-400">
                      <h2 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Our Services
                      </h2>
                    </div>
                    <div className="flex flex-wrap p-2 sm:p-3 md:p-4 gap-2 sm:gap-3 md:gap-4">
                      {clinic.practice_services.map((service) => (
                        <div
                          key={service.id}
                          className="px-3 py-2 font-medium text-sm text-gray-800 hover:bg-orange-100 hover:text-orange-600 hover:border-orange-200 rounded-full border-2 transition-all cursor-pointer"
                        >
                          {service.name}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Team */}
                {clinic.practice_team_members?.length > 0 && (
                  <section
                    id="team"
                    ref={(el) => { sectionRefs.current["team"] = el; }}
                    className="scroll-mt-36"
                  >
                    <div className="flex items-center justify-between mb-6 border-b-4 border-orange-400">
                      <h2 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Our Teamsss
                      </h2>
                      <span className="bg-orange-100 text-orange-600 text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full mb-1">
                        {clinic.practice_team_members.length} Member{clinic.practice_team_members.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="p-2 sm:p-3 md:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                      {clinic.practice_team_members.map((member) => (
                        <TeamMemberCard
                          key={member.id}
                          member={member}
                          clinic={clinic}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Gallery */}
                {galleryImages.length > 0 && (
                  <section
                    id="gallery"
                    ref={(el) => { sectionRefs.current["gallery"] = el; }}
                    className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-36"
                  >
                    <div className="flex items-center justify-between mb-6 border-b-4 border-orange-400">
                      <h2 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Gallery
                      </h2>
                    </div>
                    <div className="bg-gray-700 p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl">
                      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg">
                        <div
                          className="flex transition-transform duration-300 ease-out"
                          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                          {galleryImages.map((src, idx) => (
                            <div key={idx} className="w-full flex-shrink-0 px-1 sm:px-2">
                              <div className="relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl">
                                <div className="aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[16/9]">
                                  <img
                                    src={src}
                                    alt={`Gallery ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    loading={idx < 3 ? "eager" : "lazy"}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)}
                          className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-2.5 md:p-3 rounded-full transition-all shadow-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setCurrentSlide((prev) => (prev + 1) % galleryImages.length)}
                          className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-2.5 md:p-3 rounded-full transition-all shadow-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {/* Achievements */}
                {clinic.practice_achievements?.length > 0 && (
                  <section
                    id="achievements"
                    ref={(el) => { sectionRefs.current["achievements"] = el; }}
                    className="scroll-mt-36"
                  >
                    <div className="flex items-center justify-between mb-6 border-b-4 border-orange-400">
                      <h2 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        Achievements
                      </h2>
                      <span className="bg-orange-100 text-orange-600 text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full mb-1">
                        {clinic.practice_achievements?.length}
                      </span>
                    </div>
                    <div className="p-2 sm:p-3 md:p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {clinic.practice_achievements?.map((ach) => (
                          <div
                            key={ach.id}
                            className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-100 hover:shadow-lg transition-all group"
                          >
                            {ach.image_url && (
                              <div className="relative mb-4">
                                <img
                                  src={ach.image_url.url}
                                  alt={ach.title}
                                  className="w-20 h-20 mx-auto object-contain group-hover:scale-110 transition-transform"
                                />
                              </div>
                            )}
                            <h4 className="font-bold text-gray-900 text-center mb-2">{ach.title}</h4>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* Certifications */}
                {clinic.practice_certifications?.length > 0 && (
                  <section
                    id="certifications"
                    ref={(el) => { sectionRefs.current["certifications"] = el; }}
                    className="scroll-mt-36"
                  >
                    <div className="flex items-center justify-between mb-6 border-b-4 border-orange-400">
                      <h2 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        Certifications
                      </h2>
                      <span className="bg-orange-100 text-orange-600 text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full mb-1">
                        {clinic.practice_certifications?.length}
                      </span>
                    </div>
                    <div className="p-2 sm:p-3 md:p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {clinic.practice_certifications?.map((cert) => (
                          <div
                            key={cert.id}
                            className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-orange-200 hover:shadow-lg transition-all group"
                          >
                            {cert.image_url && (
                              <div className="relative mb-4">
                                <img
                                  src={cert.image_url.url}
                                  alt={cert.title}
                                  className="w-20 h-20 mx-auto object-contain group-hover:scale-110 transition-transform"
                                />
                              </div>
                            )}
                            <h4 className="font-bold text-gray-900 text-center mb-2">{cert.title}</h4>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* Insurances */}
                {clinic.practice_insurances?.length > 0 && (
                  <section
                    id="insurances"
                    ref={(el) => { sectionRefs.current["insurances"] = el; }}
                    className="scroll-mt-36"
                  >
                    <div className="flex items-center justify-between mb-6 border-b-4 border-orange-400">
                      <h2 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Accepted Insurances
                      </h2>
                    </div>
                    <div className="flex flex-wrap p-4 gap-3 sm:gap-4">
                      {clinic.practice_insurances.map((ins) => (
                        <div
                          key={ins.id}
                          className="px-3 py-2 font-medium text-sm text-gray-800 hover:bg-orange-100 hover:text-orange-600 hover:border-orange-200 rounded-full border-2 transition-all"
                        >
                          {ins.provider_name}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Facilities */}
                {clinic.practice_facilities?.length > 0 && (
                  <section
                    id="facilities"
                    ref={(el) => { sectionRefs.current["facilities"] = el; }}
                    className="scroll-mt-36"
                  >
                    <div className="flex items-center justify-between mb-6 border-b-4 border-orange-400">
                      <h2 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Our Facilities
                      </h2>
                    </div>
                    <div className="flex flex-wrap p-4 gap-3 sm:gap-4">
                      {clinic.practice_facilities?.map((fac) => (
                        <div
                          key={fac.id}
                          className="px-3 py-2 font-medium text-sm text-gray-800 hover:bg-orange-100 hover:text-orange-600 hover:border-orange-200 rounded-full border-2 transition-all"
                        >
                          {fac.facility_name}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Contact Us */}
                <section
                  id="contact"
                  ref={(el) => { sectionRefs.current["contact"] = el; }}
                  className="scroll-mt-36"
                >
                  <div className="mb-6 border-b-4 border-orange-400">
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Contact Us
                    </h2>
                  </div>

                  {/* Address */}
                  <div className="mb-10">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Address
                    </h4>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm sm:text-base text-gray-700">
                        {clinic.address || "Address not available"}
                        <br />
                        {clinic.city && `${clinic.city}, `}
                        {clinic.state && `${clinic.state} `}
                        {clinic.postcode}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                      {clinic.practice_phone && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-sm sm:text-base text-gray-700">{clinic.practice_phone}</span>
                        </div>
                      )}
                      {clinic.email && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm sm:text-base text-gray-700">{clinic.email}</span>
                        </div>
                      )}
                      {baseInfo?.website && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg sm:col-span-2">
                          <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          <a
                            href={baseInfo.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline text-sm sm:text-base break-all"
                          >
                            {baseInfo.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Opening Hours */}
                  <div className="mb-10">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Opening Hours
                    </h4>
                    <div className="space-y-2">
                      {openingHours.map(({ day, time, isClosed }) => (
                        <div
                          key={day}
                          className={`flex justify-between items-center px-4 py-3 rounded-lg ${
                            isClosed ? "bg-red-50 text-red-600" : "bg-green-50 text-gray-700"
                          }`}
                        >
                          <span className="font-semibold capitalize">{day}</span>
                          <span className={isClosed ? "font-bold" : "font-medium text-green-700"}>
                            {time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Social Media */}
                  {(baseInfo?.facebook_url || baseInfo?.instagram_url || baseInfo?.twitter_url || baseInfo?.youtube_url) && (
                    <div className="pt-6 border-t border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Follow Us
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {baseInfo?.facebook_url && (
                          <a href={baseInfo.facebook_url} target="_blank" rel="noreferrer" className="p-4 bg-blue-50 rounded-xl flex justify-center hover:bg-blue-100 transition-colors">
                            <svg className="w-7 h-7 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                          </a>
                        )}
                        {baseInfo?.instagram_url && (
                          <a href={baseInfo.instagram_url} target="_blank" rel="noreferrer" className="p-4 bg-pink-50 rounded-xl flex justify-center hover:bg-pink-100 transition-colors">
                            <svg className="w-7 h-7 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            </svg>
                          </a>
                        )}
                        {baseInfo?.twitter_url && (
                          <a href={baseInfo.twitter_url} target="_blank" rel="noreferrer" className="p-4 bg-sky-50 rounded-xl flex justify-center hover:bg-sky-100 transition-colors">
                            <svg className="w-7 h-7 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                          </a>
                        )}
                        {baseInfo?.youtube_url && (
                          <a href={baseInfo.youtube_url} target="_blank" rel="noreferrer" className="p-4 bg-red-50 rounded-xl flex justify-center hover:bg-red-100 transition-colors">
                            <svg className="w-7 h-7 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </section>

              </main>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 mx-auto lg:mx-0 order-first lg:order-last mb-6 lg:mb-0">
            <div className="space-y-4 lg:sticky lg:top-35">
              {/* Claim Profile Card (unverified clinics) */}
              {!isVerified && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                        </svg>
                      </div>
                      <h3 className="text-base font-bold text-gray-900">Do you own or work at this clinic?</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Claim your profile to update your clinic information and manage your online presence.
                    </p>
                    <div className="flex flex-col gap-2">
                      <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm">
                        Claim this clinic
                      </button>
                      <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-4 rounded-lg border border-gray-200 transition-colors text-sm">
                        Learn more
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Widget */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Book appointment</h3>
                </div>
                <div className="p-4 sm:p-5 space-y-4">
                  {!hasAppointments ? (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        This clinic currently does not have online appointments available.
                      </p>
                      <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Find another clinic
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <select
                          value={selectedAppointmentType}
                          onChange={(e) => {
                            setSelectedAppointmentType(e.target.value);
                            setSelectedPractitionerId("");
                          }}
                          className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-orange-600 transition-colors appearance-none cursor-pointer hover:border-gray-300 text-gray-700 text-sm sm:text-base"
                        >
                          <option value="" disabled>Select Appointment type</option>
                          {clinic.appointment_types?.map((type) => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>

                      <div className="relative">
                        <select
                          value={selectedPractitionerId}
                          onChange={(e) => setSelectedPractitionerId(e.target.value)}
                          className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-orange-600 transition-colors appearance-none cursor-pointer hover:border-gray-300 text-gray-700 text-sm sm:text-base"
                        >
                          <option value="">All Practitioner</option>
                          {practitioners.map((p) => (
                            <option key={p.id} value={p.id}>{`${p.first_name} ${p.last_name || ""}`}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>

                      {selectedAppointmentType && selectedPractitionerId && (
                        <div className="space-y-5">
                          {slotsLoading ? (
                            <div className="text-center py-4 text-gray-500">Loading slots...</div>
                          ) : (
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
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => setShowSlotsModal(true)}
                        disabled={!selectedAppointmentType || !selectedPractitionerId}
                        className={`w-full mt-4 ${!selectedAppointmentType || !selectedPractitionerId ? "bg-gray-300 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"} text-white font-semibold py-3 px-6 rounded-lg`}
                      >
                        See All Appointments
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />

      {showSlotsModal && (
        <AvailableSlots
          isOpen={showSlotsModal}
          onClose={() => setShowSlotsModal(false)}
          clinic={clinic}
          selectedDentistId={selectedPractitionerId}
        />
      )}
    </div>
  );
}

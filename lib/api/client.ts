// lib/api/client.ts

import type { SearchResult, LocationResult, Clinic, Specialty, ClinicProfile, PractitionerProfile, ClinicAppointmentType, UnclaimedPractice } from "@/lib/types";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/backend";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const FILTER_URL = `${API_BASE_URL}/clinics`;
const BOOKING_URL = `${API_BASE_URL}/booking`;

const getAuthHeaders = (): HeadersInit => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("patient_access_token")
      : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }
  return response.json() as Promise<T>;
};

interface PracticeInfoResponse {
  id: string;
  practice_name?: string | null;
  name?: string | null;
  address?: string | null;
  practice_address?: string | null;
  city?: string | null;
  state?: string | null;
  postcode?: string | null;
  logo?: string | null;
  rating?: number | null;
  email?: string | null;
  practice_phone?: string | null;
  phone?: string | null;
  practice_services?: Clinic["practice_services"];
  practice_team_members?: Clinic["practice_team_members"];
  practice_insurances?: Clinic["practice_insurances"];
  practice_opening_hours?: Clinic["practice_opening_hours"];
}

const toUnclaimedClinic = (p: UnclaimedPractice): ClinicProfile =>
  ({
    id: p.id,
    practice_name: p.practice_name || "",
    name: p.practice_name || "",
    email: p.email || "",
    phone: p.phone || "",
    practice_phone: p.phone || "",
    city: p.suburb || "",
    suburb: p.suburb || "",
    state: p.state || "",
    postcode: p.postcode || "",
    address: "",
    logo: undefined,
    banner_image: undefined,
    description: "",
    rating: 0,
    status: "INACTIVE",
    practice_services: [],
    practice_team_members: [],
    practice_insurances: [],
    practice_facilities: [],
    practice_galleries: [],
    practice_achievements: [],
    practice_certifications: [],
    practice_opening_hours: [],
    appointment_types: [],
  } as unknown as ClinicProfile);

const toClinic = (p: PracticeInfoResponse): Clinic => ({
  id: p.id,
  name: p.practice_name || p.name || "",
  practice_name: p.practice_name ?? undefined,
  address: p.address || p.practice_address || "",
  practice_address: p.practice_address ?? p.address ?? undefined,
  phone: p.phone || p.practice_phone || "",
  email: p.email || "",
  logo: p.logo || "/logo.webp",
  rating: p.rating ?? 0,
  city: p.city || "",
  state: p.state || "",
  postcode: p.postcode || "",
  practice_services: p.practice_services || [],
  practice_team_members: p.practice_team_members || [],
  practice_insurances: p.practice_insurances || [],
  practice_opening_hours: p.practice_opening_hours || [],
});

export const practiceApi = {
  getFilterOptions: async (): Promise<{
    specialties: Specialty[];
    languages: string[];
    genders: string[];
    insurances: string[];
    availableDays: string[];
  }> => {
    const [specialties, languages, genders, insurances, days] =
      await Promise.all([
        request<Specialty[]>(`${FILTER_URL}/filters/specialties`),
        request<string[]>(`${FILTER_URL}/filters/languages`),
        request<string[]>(`${FILTER_URL}/filters/genders`),
        request<string[]>(`${FILTER_URL}/filters/insurances`),
        request<string[]>(`${FILTER_URL}/filters/days`),
      ]);

    return {
      specialties: Array.isArray(specialties) ? specialties : [],
      languages: Array.isArray(languages) ? languages : [],
      genders: Array.isArray(genders) ? genders : [],
      insurances: Array.isArray(insurances) ? insurances : [],
      availableDays: Array.isArray(days) ? days : [],
    };
  },

  searchClinics: async (params: {
    specialties?: string[];
    languages?: string[];
    genders?: string[];
    insurances?: string[];
    days?: string[];
    service?: { type?: string; id?: string; name?: string } | null;
    location?: { city?: string; state?: string; postcode?: string } | null;
  }): Promise<Clinic[]> => {
    const queryParams = new URLSearchParams();

    if (params.service?.type) queryParams.set("serviceType", params.service.type);
    if (params.service?.id) queryParams.set("serviceId", params.service.id);
    if (params.service?.name) queryParams.set("serviceName", params.service.name);
    if (params.location?.city) queryParams.set("locationCity", params.location.city);
    if (params.location?.state) queryParams.set("locationState", params.location.state);
    if (params.location?.postcode) queryParams.set("locationPostcode", params.location.postcode);

    const specialtiesWithService =
      params.service?.type === "service" && params.service?.name
        ? [...new Set([...(params.specialties || []), params.service.name])]
        : params.specialties;

    const appendList = (key: string, values?: string[]) => {
      if (values && values.length > 0) {
        queryParams.set(key, values.join(","));
      }
    };

    appendList("specialties", specialtiesWithService);
    appendList("languages", params.languages);
    appendList("genders", params.genders);
    appendList("insurances", params.insurances);
    appendList("days", params.days);

    const data = await request<PracticeInfoResponse[]>(
      `${FILTER_URL}/filter?${queryParams.toString()}`
    );
    return (Array.isArray(data) ? data : []).map(toClinic);
  },

  getAllClinics: async (): Promise<Clinic[]> => {
    const data = await request<PracticeInfoResponse[]>(`${FILTER_URL}/admins`);
    return (Array.isArray(data) ? data : []).map(toClinic);
  },

  /**
   * Fetch all clinics with full profiles including practice_team_members.
   * The /admins endpoint doesn't include team members, so we fetch each
n   * clinic individually via /clinic/{id} which returns the full profile.
   */
  getAllClinicsWithTeamMembers: async (): Promise<ClinicProfile[]> => {
    const admins = await request<PracticeInfoResponse[]>(`${FILTER_URL}/admins`);
    if (!Array.isArray(admins) || admins.length === 0) return [];

    const profiles = await Promise.all(
      admins.map((admin) =>
        request<ClinicProfile>(`${FILTER_URL}/clinic/${admin.id}`).catch(() => null)
      )
    );
    console.log("profiles===================>", profiles);
    return profiles.filter((p): p is ClinicProfile => p !== null);
  },

  searchServices: async (query: string): Promise<SearchResult[]> => {
    if (!query || query.trim().length < 2) return [];
    const data = await request<SearchResult[]>(
      `${FILTER_URL}/search/services?query=${encodeURIComponent(query)}`
    );
    return Array.isArray(data) ? data : [];
  },

  searchLocations: async (query: string): Promise<LocationResult[]> => {
    if (!query || query.trim().length < 2) return [];
    const data = await request<LocationResult[]>(
      `${FILTER_URL}/search/locations?query=${encodeURIComponent(query)}`
    );
    return Array.isArray(data) ? data : [];
  },

  getWidgetAvailability: async (
    practiceId: string
  ): Promise<{ date: string; slots: string[] }[]> => {
    const today = new Date().toISOString().split("T")[0];
    const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const data = await request<
      { date: string; slots: string[] }[]
    >(
      `${BOOKING_URL}/${practiceId}/widget-availability?startDate=${today}&endDate=${end}`
    );
    return Array.isArray(data) ? data : [];
  },

  getClinicById: async (id: string): Promise<ClinicProfile> => {
    return request<ClinicProfile>(`${FILTER_URL}/clinic/${id}`);
  },

  getPractitionerById: async (id: string): Promise<PractitionerProfile> => {
    return request<PractitionerProfile>(`${FILTER_URL}/practitioner/${id}`);
  },

  getBookingAppointmentTypes: async (
    practiceId: string
  ): Promise<ClinicAppointmentType[]> => {
    const data = await request<ClinicAppointmentType[]>(
      `${BOOKING_URL}/${practiceId}/appointment-types`
    );
    return Array.isArray(data) ? data : [];
  },

  getBookingPractitioners: async (
    practiceId: string,
    appointmentTypeId: string
  ): Promise<{ id: string; first_name: string; last_name: string; image: any }[]> => {
    const data = await request<any>(
      `${BOOKING_URL}/${practiceId}/practitioners?appointmentTypeId=${appointmentTypeId}`
    );
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      const key = Object.keys(data).find((k) => Array.isArray(data[k]));
      if (key) return data[key];
    }
    return [];
  },

  getBookingAvailability: async (
    practiceId: string,
    practitionerId: string,
    appointmentTypeId: string
  ): Promise<{ date: string; dateStr: string; slots: string[] }[]> => {
    const today = new Date().toISOString().split("T")[0];
    const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const data = await request<any>(
      `${BOOKING_URL}/${practiceId}/availability?practitionerId=${practitionerId}&appointmentTypeId=${appointmentTypeId}&startDate=${today}&endDate=${end}`
    );
    // Handle both array response and wrapped object like { availability: [...] }
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      if (Array.isArray(data.availability)) return data.availability;
      const key = Object.keys(data).find((k) => Array.isArray(data[k]));
      if (key) return data[key];
    }
    return [];
  },

  getclinicProfile: async (id: string): Promise<string> => {
    console.log("id==================>", id);
    let vishws = "vishwasssssssssss" ;
    return vishws;
  },


   getUnclaimedPracticeById: async (id: string): Promise<ClinicProfile | null> => {
    try {
      const data = await request<UnclaimedPractice>(
        `${FILTER_URL}/unclaimed/${id}`
      );
      if (!data || !data.id) return null;
      return toUnclaimedClinic(data);
    } catch (error) {
      console.warn(`Unclaimed practice not found for id=${id}:`, error);
      return null;
    }
  },

  /**
   * Get all unclaimed practices (mapped to ClinicProfile shape)
   */
  getAllUnclaimedPractices: async (): Promise<ClinicProfile[]> => {
    try {
      const data = await request<UnclaimedPractice[]>(
        `${FILTER_URL}/unclaimed`
      );
      return (Array.isArray(data) ? data : []).map(toUnclaimedClinic);
    } catch (error) {
      console.warn("Failed to fetch unclaimed practices:", error);
      return [];
    }
  },
  
};

// lib/types.ts
// Central type definitions for the Next.js project, mirroring the React project's types.

// ==================== FILE IMAGE ====================
export interface FileImage {
  url: string;
  name: string;
  path: string;
  size: number;
  file_id: string;
  mime_type: string;
}

// ==================== TIME SLOT ====================
export interface TimeSlot {
  start: string;
  end: string;
}

// ==================== PRACTICE SERVICE ====================
export interface PracticeService {
  id: string;
  name: string;
  all_service_id?: string | null;
}

// ==================== PRACTICE BASE INFO ====================
export interface PracticeBaseInfo {
  id: string;
  website?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  youtube_url?: string | null;
}

// ==================== PRACTITIONER APPOINTMENT TYPE ====================
export interface PractitionerAppointmentType {
  id: string;
  practice_id: string;
  practitioner_id: string;
  appointment_type_id: string;
  patient_type: "New" | "Existing";
  enabled: boolean;
  duration: number | null;
  future_booking_limit: number;
  created_at: string;
  updated_at: string;
  appointment_type: ClinicAppointmentType;
}

// ==================== PRACTICE TEAM MEMBER ====================
export interface PracticeTeamMember {
  id: string;
  first_name: string;
  last_name: string;
  gender: string | null;
  languages: any[] | null;
  qualification?: string | null;
  image?: FileImage | null;
  specialization?: string | null;
  experience_years?: number | null;
  bio?: string | null;
  role?: string | null;
  updated_at?: string | null;
  practitioner_appointment_types?: PractitionerAppointmentType[] | null;
}

// Extended team member detail (used in clinic profile)
export interface PracticeTeamMemberDetail {
  id: string;
  first_name: string;
  last_name: string;
  gender: string | null;
  languages: any[] | null;
  qualification?: string | null;
  image?: FileImage | null;
  updated_at?: string | null;
  practitioner_appointment_types?: PractitionerAppointmentType[] | null;
}

// ==================== PRACTICE INSURANCE ====================
export interface PracticeInsurance {
  id: string;
  provider_name: string;
}

// ==================== PRACTICE OPENING HOUR ====================
export interface PracticeOpeningHour {
  id: string;
  day_of_week: string;
  is_open: boolean;
  opening_time?: string | null;
  closing_time?: string | null;
  time_slots?: TimeSlot[] | null;
}

export interface PracticeOpeningHourDetail {
  id: string;
  day_of_week: string;
  is_open: boolean;
  time_slots: TimeSlot[] | null;
}

// ==================== PRACTICE FACILITY ====================
export interface PracticeFacility {
  id: string;
  facility_name: string;
}

// ==================== PRACTICE GALLERY IMAGE ====================
export interface PracticeGalleryImage {
  id: string;
  image_url: FileImage | null;
  caption?: string | null;
}

// ==================== PRACTICE ACHIEVEMENT ====================
export interface PracticeAchievement {
  id: string;
  title: string;
  description?: string | null;
  image_url?: FileImage | null;
  award_year?: number | null;
  awarded_by?: string | null;
}

// ==================== PRACTICE CERTIFICATION ====================
export interface PracticeCertification {
  id: string;
  title: string;
  certification_number?: string | null;
  image_url?: FileImage | null;
  issued_date?: string | null;
  expiry_date?: string | null;
  issuing_authority?: string | null;
}

// ==================== PRACTICE EXCEPTION ====================
export interface PracticeException {
  id: string;
  exception_date: string;
  is_closed: boolean;
  start_time: string | null;
  end_time: string | null;
  label: string | null;
  note: string | null;
}

// ==================== APPOINTMENT TYPE ====================
export interface ClinicAppointmentType {
  id: string;
  practice_id: string;
  name: string;
  existing_enabled: boolean;
  existing_duration: number | null;
  existing_future_booking_limit: number | null;
  new_enabled: boolean;
  new_duration: number | null;
  new_future_booking_limit: number | null;
  new_terms_enabled: boolean;
  online_enabled: boolean;
  ask_reason: boolean;
  add_message: boolean;
  unavailable_action: string;
  cancellation_enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ==================== CLINIC (list item) ====================
export interface Clinic {
  id: string;
  name: string;
  practice_name?: string;
  address: string;
  practice_address?: string;
  phone: string;
  email: string;
  logo: string | FileImage | null;
  rating: number;
  city: string;
  state: string;
  postcode: string;
  practice_services: PracticeService[];
  practice_team_members: PracticeTeamMember[];
  practice_insurances: PracticeInsurance[];
  practice_opening_hours: PracticeOpeningHour[];
  updated_at?: string;
}

// ==================== CLINIC PROFILE (full detail) ====================
export interface ClinicProfile {
  id: string;
  practice_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  description: string | null;
  logo: FileImage | null;
  banner_image: FileImage | null;
  email: string | null;
  practice_phone: string | null;
  status: string | null;
  practice_base_info?: PracticeBaseInfo | null;
  appointment_types?: ClinicAppointmentType[];
  practice_services: PracticeService[];
  practice_team_members: PracticeTeamMemberDetail[];
  practice_insurances: PracticeInsurance[];
  practice_opening_hours: PracticeOpeningHourDetail[];
  practice_facilities: PracticeFacility[];
  practice_galleries: PracticeGalleryImage[];
  practice_achievements: PracticeAchievement[];
  practice_certifications: PracticeCertification[];
  practice_exceptions?: PracticeException[];
}

// ==================== PRACTITIONER PROFILE ====================
export interface PractitionerProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string | null;
  qualification: string | null;
  gender: string | null;
  ahpra_number: string | null;
  education: string | null;
  languages: any[] | null;
  professional_statement: string | null;
  image: FileImage | null;
  is_visible_online: boolean | null;
  practitioner_practice_services: PractitionerPracticeService[];
  practitioner_appointment_types?: PractitionerAppointmentType[];
  practice_info?: {
    id: string;
    practice_name: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    postcode: string | null;
    email: string | null;
    practice_phone: string | null;
    status: string | null;
    logo: FileImage | null;
    banner_image: FileImage | null;
    practice_base_info: PracticeBaseInfo | null;
    practice_opening_hours: PracticeOpeningHourDetail[];
    [key: string]: any;
  };
}

// ==================== PRACTITIONER PRACTICE SERVICE ====================
export interface PractitionerPracticeService {
  practice_service_id: string;
  practice_service: PracticeService;
}

// ==================== SPECIALTY ====================
export interface Specialty {
  id: string;
  service_name: string;
  image_url?: { url: string; name?: string }[] | null;
}

// ==================== SEARCH & FILTER ====================
export interface SearchResult {
  type: "service" | "practice" | "practitioner";
  id: string;
  name: string;
  subtitle: string;
  practiceId?: string;
}

export interface LocationResult {
  city: string;
  state: string;
  postcode: string;
  displayText: string;
}

export interface FilterOptions {
  specialties: Specialty[];
  languages: string[];
  genders: string[];
  insurances: string[];
  availableDays: string[];
}

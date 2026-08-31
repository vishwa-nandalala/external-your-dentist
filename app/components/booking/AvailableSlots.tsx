"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { practiceApi } from "@/lib/api/client";
import type {
  ClinicProfile,
  ClinicAppointmentType,
  PracticeTeamMemberDetail,
} from "@/lib/types";

interface AvailableSlotsProps {
  clinic: ClinicProfile | null;
  selectedDentistId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AvailableSlots({
  clinic,
  selectedDentistId,
  isOpen,
  onClose,
}: AvailableSlotsProps) {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedAppointmentType, setSelectedAppointmentType] = useState("");
  const [selectedPractitioner, setSelectedPractitioner] = useState("");
  const [appointmentTypes, setAppointmentTypes] = useState<ClinicAppointmentType[]>([]);
  const [clinicPractitioners, setClinicPractitioners] = useState<PracticeTeamMemberDetail[]>([]);
  const [availability, setAvailability] = useState<{ date: string; dateStr: string; slots: string[] }[]>([]);
  const [loading, setLoading] = useState(false);

  const formatDateToYMD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const changeMonth = (offset: number) => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  useEffect(() => {
    if (!isOpen || !clinic) return;
    setAppointmentTypes(clinic.appointment_types ?? []);
    setClinicPractitioners(clinic.practice_team_members ?? []);
    setSelectedPractitioner(selectedDentistId ?? clinic.practice_team_members?.[0]?.id ?? "");
    setSelectedAppointmentType("");
    setViewDate(new Date());
    setSelectedDateStr("");
    setSelectedTime("");
  }, [isOpen, clinic, selectedDentistId]);

  useEffect(() => {
    if (!isOpen || !clinic) return;
    if (appointmentTypes.length && !selectedAppointmentType) {
      setSelectedAppointmentType(appointmentTypes[0].id);
    }
  }, [isOpen, appointmentTypes, selectedAppointmentType]);

  useEffect(() => {
    if (clinicPractitioners.length && !clinicPractitioners.some((p) => p.id === selectedPractitioner)) {
      setSelectedPractitioner(clinicPractitioners[0]?.id ?? "");
    }
  }, [clinicPractitioners, selectedPractitioner]);

  useEffect(() => {
    if (!isOpen || !selectedPractitioner || !selectedAppointmentType || !clinic?.id) {
      setAvailability([]);
      return;
    }
    setLoading(true);
    practiceApi
      .getBookingAvailability(clinic.id, selectedPractitioner, selectedAppointmentType)
      .then((data) => setAvailability(data))
      .catch(() => setAvailability([]))
      .finally(() => setLoading(false));
  }, [isOpen, selectedPractitioner, selectedAppointmentType, clinic?.id]);

  useEffect(() => {
    if (!availability.length) return;
    const selectedStillExists = availability.some((d) => d.date === selectedDateStr);
    if (!selectedStillExists) {
      setSelectedDateStr(availability[0].date);
    }
  }, [availability, selectedDateStr]);

  const handleSlotClick = (date: string, time: string) => {
    if (!clinic) return;

    const practitioner = clinicPractitioners.find((p) => p.id === selectedPractitioner);
    const appointmentType = appointmentTypes.find((a) => a.id === selectedAppointmentType);
    const savedState = sessionStorage.getItem("bookingState");
    const parsed = savedState ? JSON.parse(savedState) : {};

    sessionStorage.setItem(
      "bookingState",
      JSON.stringify({
        ...parsed,
        selectedDate: date,
        selectedDateStr: date,
        selectedTime: time,
        selectedPractitioner: selectedPractitioner,
        selectedPractitionerId: selectedPractitioner,
        selectedAppointmentTypeId: selectedAppointmentType,
        clinicId: clinic.id,
        clinicName: clinic.practice_name,
        practitionerAppointmentTypes: practitioner?.practitioner_appointment_types ?? [],
        practitionerData: practitioner
          ? {
              id: practitioner.id,
              first_name: practitioner.first_name,
              last_name: practitioner.last_name,
              image: practitioner.image ?? null,
            }
          : null,
        selectedAppointmentTypeName: appointmentType?.name,
        selectedAppointmentAskReason: appointmentType?.ask_reason,
        clinic,
      })
    );

    const reactAppUrl = process.env.NEXT_PUBLIC_REACT_APP_URL || "http://localhost:5173";
    window.location.href = `${reactAppUrl}/booking/${clinic.id}/step-1`;
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const availableDates = new Set(availability.map((item) => item.date));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8 lg:h-10 lg:w-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateString = formatDateToYMD(currentDate);
      const isAvailable = availableDates.has(dateString);
      const isSelected = selectedDateStr === dateString;
      const checkDate = new Date(year, month, day);
      checkDate.setHours(0, 0, 0, 0);
      const isPast = checkDate < today;

      let buttonClass =
        "h-8 w-8 lg:h-10 lg:w-10 rounded-full flex items-center justify-center text-xs lg:text-sm transition-colors ";
      if (isSelected) buttonClass += "bg-orange-600 text-white font-bold";
      else if (isPast) buttonClass += "text-gray-300 cursor-not-allowed";
      else if (isAvailable) buttonClass += "text-gray-700 font-bold hover:bg-orange-100 cursor-pointer";
      else buttonClass += "text-gray-400";

      days.push(
        <button
          key={day}
          disabled={!isAvailable || isPast}
          onClick={() => setSelectedDateStr(dateString)}
          className={buttonClass}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const selectedDaySlots = availability.find((item) => item.date === selectedDateStr) ?? availability[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-md"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col xl:flex-row">
            {/* LEFT: Calendar Section */}
            <div className="w-full xl:w-[380px] border-r border-gray-100 bg-gray-50 p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-bold text-gray-800">
                  {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
                  >
                    &#9664;
                  </button>
                  <button
                    onClick={() => changeMonth(1)}
                    className="h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
                  >
                    &#9654;
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 mb-4 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                  <span key={idx} className="text-xs font-medium text-gray-500">
                    {day}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-3 place-items-center">{renderCalendar()}</div>

              {/* FIXED: Appointment Type and Practitioner Dropdowns */}
              <div className="space-y-4 mt-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Appointment Type
                  </label>
                  <select
                    value={selectedAppointmentType}
                    onChange={(e) => {
                      setSelectedAppointmentType(e.target.value);
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                    }}
                  >
                    {appointmentTypes.map((a) => (
                      <option key={a.id} value={a.id} className="text-gray-700">
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Practitioner
                  </label>
                  <select
                    value={selectedPractitioner}
                    onChange={(e) => setSelectedPractitioner(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                    }}
                  >
                    {clinicPractitioners.map((p) => (
                      <option key={p.id} value={p.id} className="text-gray-700">
                        {p.first_name} {p.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* RIGHT: Time Slots Section - FIXED */}
            <div className="flex-1 p-6 lg:p-10">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-100 border-t-orange-600" />
                </div>
              ) : selectedDaySlots ? (
                <>
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900">
                      {new Date(selectedDaySlots.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Available slots for this date</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
                    {selectedDaySlots?.slots?.map((time: string) => (
                      <button
                        key={time}
                        onClick={() => handleSlotClick(selectedDaySlots.date, time)}
                        className={`h-14 rounded-xl border-2 font-semibold text-sm transition-all duration-200 ${
                          selectedTime === time
                            ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm"
                            : "border-gray-200 bg-white text-gray-700 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  No slots available for this date.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
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
      if (isSelected) buttonClass += "bg-[#19A7A0] text-white font-bold shadow-sm";
      else if (isPast) buttonClass += "text-[#8AA0AE]/50 cursor-not-allowed";
      else if (isAvailable) buttonClass += "text-[#163A5F] font-bold hover:bg-[#E8F8F7] hover:text-[#19A7A0] cursor-pointer";
      else buttonClass += "text-[#8AA0AE]";

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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#163A5F]/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Main Modal */}
      <div className="relative bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DDEEEE]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-[#F4FAFA] hover:bg-[#E8F8F7] text-[#5A7185] hover:text-[#19A7A0] w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-md border border-[#DDEEEE]"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm border border-[#DDEEEE] overflow-hidden flex flex-col xl:flex-row">

            {/* LEFT: Calendar Section */}
            <div className="w-full xl:w-[380px] border-r border-[#DDEEEE] bg-[#F4FAFA] p-6 lg:p-8">

              {/* Month Header */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-bold text-[#163A5F]">
                  {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="h-10 w-10 rounded-full border border-[#DDEEEE] bg-white text-[#163A5F] hover:bg-[#E8F8F7] hover:text-[#19A7A0] transition-colors"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => changeMonth(1)}
                    className="h-10 w-10 rounded-full border border-[#DDEEEE] bg-white text-[#163A5F] hover:bg-[#E8F8F7] hover:text-[#19A7A0] transition-colors"
                  >
                    ▶
                  </button>
                </div>
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 mb-4 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                  <span key={idx} className="text-xs font-semibold text-[#163A5F]/50">
                    {day}
                  </span>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-y-3 place-items-center">
                {renderCalendar()}
              </div>

              {/* Filters: Appointment Type + Practitioner */}
              <div className="space-y-4 mt-6">

                {/* Appointment Type */}
                <div>
                  <label className="block text-sm font-semibold text-[#163A5F] mb-2">
                    Appointment Type
                  </label>
                  <select
                    value={selectedAppointmentType}
                    onChange={(e) => setSelectedAppointmentType(e.target.value)}
                    className="w-full border border-[#DDEEEE] rounded-xl p-3 bg-white text-[#163A5F] outline-none focus:border-[#19A7A0] focus:ring-2 focus:ring-[#5ED6D0]/30 transition-colors appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2319A7A0'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1.25em 1.25em",
                      paddingRight: "2.5rem",
                    }}
                  >
                    {appointmentTypes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Practitioner */}
                <div>
                  <label className="block text-sm font-semibold text-[#163A5F] mb-2">
                    Practitioner
                  </label>
                  <select
                    value={selectedPractitioner}
                    onChange={(e) => setSelectedPractitioner(e.target.value)}
                    className="w-full border border-[#DDEEEE] rounded-xl p-3 bg-white text-[#163A5F] outline-none focus:border-[#19A7A0] focus:ring-2 focus:ring-[#5ED6D0]/30 transition-colors appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2319A7A0'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1.25em 1.25em",
                      paddingRight: "2.5rem",
                    }}
                  >
                    {clinicPractitioners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.first_name} {p.last_name}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            {/* RIGHT: Time Slots Section */}
            <div className="flex-1 p-6 lg:p-10 bg-white">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E8F8F7] border-t-[#19A7A0]" />
                </div>
              ) : selectedDaySlots ? (
                <>
                  {/* Selected Date */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-[#163A5F]">
                      {new Date(selectedDaySlots.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <p className="text-sm text-[#163A5F]/60 mt-1">
                      Available slots for this date
                    </p>
                  </div>

                  {/* Time Slot Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
                    {selectedDaySlots?.slots?.map((time: string) => (
                      <button
                        key={time}
                        onClick={() => handleSlotClick(selectedDaySlots.date, time)}
                        className={`h-14 rounded-xl border-2 font-semibold text-sm transition-all duration-200 ${
                          selectedTime === time
                            ? "border-[#19A7A0] bg-[#E8F8F7] text-[#19A7A0] shadow-sm"
                            : "border-[#DDEEEE] bg-white text-[#163A5F] hover:border-[#19A7A0] hover:text-[#19A7A0] hover:bg-[#E8F8F7]/50"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-[#163A5F]/50">
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
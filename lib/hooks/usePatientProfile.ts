"use client";

import { useEffect, useState } from "react";
import { getProfile, type PatientProfile } from "@/lib/api/patientApi";

export const useProfile = () => {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const patient = await getProfile();
        if (!cancelled) setPatient(patient);
      } catch {
        if (!cancelled) setPatient(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  return { patient, loading };
};

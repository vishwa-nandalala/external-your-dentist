// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/backend";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;

const authListeners = new Set<() => void>();

export const subscribeAuth = (listener: () => void) => {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
};

const notifyAuthChanged = () => {
  authListeners.forEach((listener) => listener());
};

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("patient_access_token");
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const logout = () => {
  localStorage.removeItem("patient_access_token");
  localStorage.removeItem("patient");
  sessionStorage.removeItem("bookingState");
  notifyAuthChanged();
};

export interface PatientProfile {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  [key: string]: unknown;
}

export const getProfile = async (): Promise<PatientProfile | null> => {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/patient/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.patient ?? null;
  } catch {
    return null;
  }
};

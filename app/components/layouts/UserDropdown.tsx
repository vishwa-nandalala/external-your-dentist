"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { User, LogOut, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/hooks/usePatientProfile";
import { logout } from "@/lib/api/patientApi";

const emptySubscribe = () => () => {};

interface UserDropdownProps {
  className?: string;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  className = '',
}) => {
  const { patient } = useProfile();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const portalReady = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const handleDashboard = () => {
    router.push('/dashboard');
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      setShowLogoutModal(false);
      logout();
      router.replace('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  if (!patient) return null;

  return (
    <>
      <div
        className={`flex items-center gap-2 ${className}`}
      >
        <button
          onClick={handleDashboard}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:text-orange-600 transition-colors"
          title="Go to Dashboard"
        >
          <User size={18} />

          <span className="text-sm font-medium hidden sm:inline">
            {patient.first_name} {patient.last_name}
          </span>
        </button>

        <div className="h-5 w-px bg-gray-300 mx-1"></div>

        <button
          onClick={handleLogoutClick}
          className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>

      {showLogoutModal && portalReady &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={cancelLogout}
            />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 m-4">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle
                    className="text-red-600"
                    size={24}
                  />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Sign out?
                </h3>

                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to sign out?
                  You will need to log in again to access
                  your dashboard.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={cancelLogout}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmLogout}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default UserDropdown;

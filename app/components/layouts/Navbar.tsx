"use client";

import { useState, useSyncExternalStore } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserDropdown from "./UserDropdown";
import { isAuthenticated, logout, subscribeAuth } from "@/lib/api/patientApi";
import { useProfile } from "@/lib/hooks/usePatientProfile";

const emptySubscribe = () => () => {};

const Navbar: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const hydrated = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );
    const authenticated = useSyncExternalStore(
        subscribeAuth,
        () => isAuthenticated(),
        () => false
    );
    const { patient } = useProfile();
    const router = useRouter();

    const handleLogout = async () => {
        logout();
        setMenuOpen(false);
        router.replace('/');
    };


    return (
        <nav className="w-full bg-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">

                <Link href="/" className="flex items-center gap-2">
                    <img src="/logo.svg" alt="Logo" className="h-6 sm:h-7 md:h-8 w-auto" />
                </Link>

                <div className="hidden md:flex items-center space-x-2 lg:space-x-4">

                    <Link href={`${process.env.NEXT_PUBLIC_REACT_APP_URL || "http://localhost:5173"}/list-your-practice`} target='blank' rel="noopener noreferrer">
                        <button className="px-3 lg:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm md:text-base text-black hover:text-orange-600 transition">
                            List Your Practice
                        </button>
                    </Link>

                    {!hydrated ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>
                    ) : authenticated ? (
                        <UserDropdown />
                    ) : (
                        <Link href={`${process.env.NEXT_PUBLIC_REACT_APP_URL || "http://localhost:5173"}/login`}>
                            <button className="px-3 lg:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm md:text-base text-black hover:text-orange-600 transition">
                                Login
                            </button>
                        </Link>
                    )}
                </div>

                <button
                    className="md:hidden p-1.5 sm:p-2"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <X size={22} className="sm:w-6 sm:h-6" /> : <Menu size={22} className="sm:w-6 sm:h-6" />}
                </button>
            </div>

            {menuOpen && (
                <div className="md:hidden mt-2 sm:mt-3 space-y-2 pb-2 sm:pb-3">

                    <Link href="/list-your-practice">
                        <button
                            onClick={() => setMenuOpen(false)}
                            className="w-full px-4 py-2 rounded-lg font-bold text-sm text-black focus:text-orange-600 transition"
                        >
                            List Your Practice
                        </button>
                    </Link>

                    {hydrated && authenticated ? (
                        <>
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    router.push('/dashboard');
                                }}
                                className="w-full px-4 py-2 rounded-lg text-left font-medium text-sm text-gray-700 hover:text-orange-600 transition"
                            >
                                {patient ? `${patient.first_name} ${patient.last_name}` : "Dashboard"}
                            </button>
                            <button onClick={handleLogout} className="w-full px-4 py-2 rounded-lg font-bold text-sm text-red-600 hover:text-red-700 transition">
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link href="/login">
                            <button
                                onClick={() => setMenuOpen(false)}
                                className="w-full px-4 py-2 rounded-lg font-bold text-sm text-black focus:text-orange-600 transition"
                            >
                                Login
                            </button>
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;

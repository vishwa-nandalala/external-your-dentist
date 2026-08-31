"use client";

import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Home", path: "/" },
    { label: "Find Dentists", path: "/find-dentists" },
    { label: "Services", path: "/services" },
    { label: "About Us", path: "/aboutus" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                <span className="text-orange-600">Y</span>our
                <span className="text-orange-600">D</span>entist
              </h2>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm">
              Connecting patients with trusted dental professionals for better oral health.
            </p>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {quickLinks.map(({ label, path }) => (
                <li key={label}>
                  <Link href={path} className="text-xs sm:text-sm text-gray-300 hover:text-orange-400 transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact Info</h3>
            <p className="text-gray-300 text-xs sm:text-sm">123 Dental Street, City, State 12345</p>
            <p className="text-gray-300 text-xs sm:text-sm mt-2">(123) 456-7890</p>
            <p className="text-gray-300 text-xs sm:text-sm mt-2">info@yourdentist.com</p>
          </div>
        </div>

        <div className="flex justify-center gap-6 mb-6 sm:mb-8">
          <a className="text-gray-400 hover:text-cyan-400" href="#">
            <i className="bi bi-twitter text-xl sm:text-2xl"></i>
          </a>
          <a className="text-gray-400 hover:text-red-400" href="#">
            <i className="bi bi-instagram text-xl sm:text-2xl"></i>
          </a>
          <a className="text-gray-400 hover:text-blue-400" href="#">
            <i className="bi bi-facebook text-xl sm:text-2xl"></i>
          </a>
        </div>

        <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            &copy; {currentYear} Your Dentist. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            <Link href="/privacy-policy" className="hover:text-orange-400 mr-4">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-orange-400">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

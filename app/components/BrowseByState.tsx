// app/components/BrowseByState.tsx

"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { practiceApi } from "@/lib/api/client";

interface StateGroup {
  code: string;
  name: string;
  clinics: number;
  image?: string;
}

const stateNames: Record<string, string> = {
  NSW: "New South Wales",
  QLD: "Queensland",
  VIC: "Victoria",
  ACT: "Australian Capital Territory",
  SA: "South Australia",
  WA: "Western Australia",
  TAS: "Tasmania",
  NT: "Northern Territory",
};

// Resolve a state value ("NSW", "nsw", "New South Wales", ...) to a state code
const getStateCode = (value?: string | null): string | null => {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  if (stateNames[normalized]) return normalized;
  const match = Object.entries(stateNames).find(
    ([, name]) => name.toUpperCase() === normalized
  );
  return match ? match[0] : null;
};

// Same extraction as the frontend reference: state is the second-last word of the address
const getStateCodeFromAddress = (address?: string | null): string | null => {
  if (!address) return null;
  const parts = address.trim().split(" ");
  if (parts.length < 2) return null;
  return getStateCode(parts[parts.length - 2]);
};

const BrowseByState = () => {
  const [states, setStates] = useState<StateGroup[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const clinics = await practiceApi.getAllClinics();
        const map: Record<string, StateGroup> = {};

        clinics.forEach((clinic) => {
          const code =
            getStateCode(clinic.state) ||
            getStateCodeFromAddress(clinic.address);
          if (!code) return;

          if (!map[code]) {
            map[code] = {
              code,
              name: stateNames[code] ?? code,
              clinics: 0,
              image: `/states/${code.toLowerCase()}.png`,
            };
          }
          map[code].clinics += 1;
        });

        // Sort by number of clinics (optional, but looks better)
        const sortedStates = Object.values(map).sort(
          (a, b) => b.clinics - a.clinics
        );
        setStates(sortedStates);
      } catch (error) {
        console.error("Error loading clinics:", error);
      }
    };

    loadData();
  }, []);

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header Section */}
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
            Browse Dental Practices by State
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mt-2">
            Discover trusted dental practices across Australia and find experienced dentists near you
          </p>
        </div>
        {/* Responsive Grid System
            Mobile: 1 column
            Small Tablet: 2 columns
            Laptop: 3 columns
            Desktop: 4 columns
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-10">
          {states.map((item) => (
            <div
              key={item.code}
              className="group relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 hover:border-orange-500 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Decorative Watermark (Background Text) */}
              <span className="absolute -bottom-5 -right-4 text-6xl sm:text-8xl font-black text-orange-100 select-none transition-transform duration-500 group-hover:scale-110 group-hover:text-orange-200">
                {item.code}
              </span>
              {/* Optional: Map Image Overlay (if exists) */}
              {item.image && (
                <img
                  src={item.image}
                  alt=""
                  className="absolute bottom-4 right-4 w-12 sm:w-16 h-16 sm:h-25 object-contain opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60 group-hover:scale-125 transition-all duration-300 mb-20"
                />
              )}
              {/* Card Content */}
              <div className="relative z-10 h-full flex flex-col justify-between min-h-[120px] sm:min-h-[140px]">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold group-hover:text-orange-600 transition-colors">
                      {item.name}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400">
                    {item.clinics} Practice{item.clinics !== 1 && "s"} Available
                  </p>
                </div>
                {/* Call to Action Button */}
                <div className="mt-4 sm:mt-6 flex items-center gap-2 text-orange-600 font-semibold text-xs sm:text-sm group-hover:gap-3 transition-all">
                  Browse Clinics
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <ArrowRight size={14} className="sm:w-4 sm:h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrowseByState;

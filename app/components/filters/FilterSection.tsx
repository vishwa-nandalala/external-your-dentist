
// // app/components/filters/FilterSection.tsx

// "use client";

// import React, { useState } from 'react';
// import { ChevronDown, ChevronUp } from 'lucide-react';

// interface FilterSectionProps {
//   title: string;
//   options: any[];
//   selectedValues: string[];
//   onChange: (values: string[]) => void;
//   displayKey?: string;
// }

// const FilterSection: React.FC<FilterSectionProps> = ({
//   title,
//   options,
//   selectedValues,
//   onChange,
//   displayKey = 'name',
// }) => {
//   const [isExpanded, setIsExpanded] = useState(true);

//   const toggleOption = (value: string) => {
//     if (selectedValues.includes(value)) {
//       onChange(selectedValues.filter((v) => v !== value));
//     } else {
//       onChange([...selectedValues, value]);
//     }
//   };

//   // If no options, don't render
//   if (!options || options.length === 0) {
//     return null;
//   }

//   return (
//     <div className="border-b border-gray-200 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
//       <button
//         onClick={() => setIsExpanded(!isExpanded)}
//         className="flex items-center justify-between w-full group"
//       >
//         <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
//         {isExpanded ? (
//           <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
//         ) : (
//           <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
//         )}
//       </button>

//       {isExpanded && (
//         <div className="mt-2 space-y-2">
//           {options.map((option) => {
//             const value = typeof option === 'string' ? option : option[displayKey];
//             const isSelected = selectedValues.includes(value);

//             return (
//               <label
//                 key={value}
//                 className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-1 py-1 rounded transition-colors"
//               >
//                 <input
//                   type="checkbox"
//                   checked={isSelected}
//                   onChange={() => toggleOption(value)}
//                   className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
//                 />
//                 <span className="text-sm text-gray-700">{value}</span>
//               </label>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default FilterSection;

// components/filters/FilterSection.tsx
"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterSectionProps {
  title: string;
  options: any[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  displayKey?: string;
  defaultExpanded?: boolean;
  isGlobalRadio?: boolean; // Global radio mode
  activeFilterType?: string; // Currently active filter category
  setActiveFilterType?: (type: string) => void; // Set active category
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  options,
  selectedValues,
  onChange,
  displayKey = 'name',
  defaultExpanded = false,
  isGlobalRadio = false,
  activeFilterType,
  setActiveFilterType,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!options || options.length === 0) return null;

  const handleChange = (value: string, isSelected: boolean) => {
    if (isGlobalRadio) {
      // Global radio: Only one selection across ALL filters
      if (isSelected) {
        // Deselect this option
        onChange([]);
        if (setActiveFilterType) setActiveFilterType('');
      } else {
        // Select this option (clears all others)
        onChange([value]);
        if (setActiveFilterType) setActiveFilterType(title);
      }
    } else {
      // Normal checkbox behavior
      if (isSelected) {
        onChange(selectedValues.filter((v) => v !== value));
      } else {
        onChange([...selectedValues, value]);
      }
    }
  };

  return (
    <div className="border-b border-gray-200 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full group py-1"
      >
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
          {title}
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option[displayKey];
            const isSelected = selectedValues.includes(value);
            const isActiveCategory = activeFilterType === title;

            return (
              <label
                key={value}
                className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-1 py-1 rounded transition-colors ${
                  isGlobalRadio && !isActiveCategory && selectedValues.length > 0
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <input
                  type={isGlobalRadio ? 'radio' : 'checkbox'}
                  name={isGlobalRadio ? 'globalFilter' : undefined}
                  checked={isSelected}
                  onChange={() => handleChange(value, isSelected)}
                  disabled={isGlobalRadio && !isActiveCategory && selectedValues.length > 0}
                  className={`w-4 h-4 border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer ${
                    isGlobalRadio ? 'rounded-full' : 'rounded'
                  } ${
                    isGlobalRadio && !isActiveCategory && selectedValues.length > 0
                      ? 'cursor-not-allowed opacity-50'
                      : ''
                  }`}
                />
                <span className="text-sm text-gray-700">{value}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterSection;
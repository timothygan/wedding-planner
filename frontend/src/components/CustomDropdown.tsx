import { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'transparent';
  onClick?: (e: React.MouseEvent) => void;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className = '',
  variant = 'default',
  onClick,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    if (options.find((opt) => opt.value === optionValue)?.disabled) return;
    onChange(optionValue);
    setIsOpen(false);
  };

  const baseClasses = variant === 'transparent'
    ? 'bg-white/20 backdrop-blur-sm border border-white/30 text-ivory'
    : 'bg-ivory border border-old-gold text-graphite';

  const hoverClasses = variant === 'transparent'
    ? 'hover:bg-white/30 hover:border-white/40'
    : 'hover:border-forest-moss';

  return (
    <div
      ref={dropdownRef}
      className={`relative ${className}`}
      onClick={onClick}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`
          w-full px-4 py-2.5 rounded-xl font-medium
          cursor-pointer focus:outline-none focus:ring-2
          transition-all duration-300 ease-in-out
          flex items-center justify-between
          ${baseClasses}
          ${hoverClasses}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isOpen ? (variant === 'transparent' ? 'bg-white/30 border-white/40' : 'border-forest-moss ring-2 ring-forest-moss ring-opacity-20') : ''}
        `}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div
        className={`
          absolute z-50 w-full mt-2 rounded-xl shadow-xl
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
          ${variant === 'transparent' ? 'bg-white/95 backdrop-blur-md border border-white/40' : 'bg-ivory border border-old-gold'}
        `}
        style={{
          maxHeight: isOpen ? '300px' : '0',
        }}
      >
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={option.disabled}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(option.value);
              }}
              className={`
                w-full px-4 py-3 text-left
                transition-all duration-200 ease-in-out
                flex items-center justify-between
                ${variant === 'transparent' ? 'text-graphite' : 'text-graphite'}
                ${value === option.value
                  ? variant === 'transparent'
                    ? 'bg-forest-moss text-ivory font-semibold'
                    : 'bg-forest-moss text-ivory font-semibold'
                  : 'hover:bg-old-gold hover:bg-opacity-10'
                }
                ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                border-b border-old-gold border-opacity-20 last:border-b-0
              `}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <svg
                  className="w-5 h-5 text-ivory"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


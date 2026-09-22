"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";

export interface Option {
  value: string;
  label: string;
  isOtpRequired?: boolean;
  isUnlocked?: boolean;
}

interface SearchableSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SearchableSelect({
  label,
  options = [],
  value,
  onChange,
  className = "",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown on pressing Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Reset search filter when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  let filteredOptions = (options || []).filter((option) =>
    (option.label || "").toLowerCase().includes(search.toLowerCase())
  );

  const isPriceFilter = label.toLowerCase() === "price";
  const cleanSearch = search.trim();
  if (isPriceFilter && cleanSearch && !isNaN(Number(cleanSearch))) {
    const numericValue = cleanSearch;
    const formattedPrice = Number(numericValue).toLocaleString("en-IN");
    const existsLte = (options || []).some((opt) => opt.value === `lte${numericValue}`);
    if (!existsLte) {
      filteredOptions = [
        {
          value: `lte${numericValue}`,
          label: `Up to ₹${formattedPrice}`,
        },
        {
          value: `eq${numericValue}`,
          label: `Exact ₹${formattedPrice}`,
        },
        {
          value: `gte${numericValue}`,
          label: `Above ₹${formattedPrice}`,
        },
        ...filteredOptions,
      ];
    }
  }

  const getSelectedOption = () => {
    const found = (options || []).find((option) => option.value === value);
    if (found) return found;

    if (isPriceFilter && value) {
      if (value.startsWith("lte")) {
        const num = value.slice(3);
        if (!isNaN(Number(num))) {
          return { value, label: `Up to ₹${Number(num).toLocaleString("en-IN")}` };
        }
      }
      if (value.startsWith("gte")) {
        const num = value.slice(3);
        if (!isNaN(Number(num))) {
          return { value, label: `Above ₹${Number(num).toLocaleString("en-IN")}` };
        }
      }
      if (value.startsWith("eq")) {
        const num = value.slice(2);
        if (!isNaN(Number(num))) {
          return { value, label: `Exact ₹${Number(num).toLocaleString("en-IN")}` };
        }
      }
      if (!isNaN(Number(value))) {
        return { value, label: `Up to ₹${Number(value).toLocaleString("en-IN")}` };
      }
    }
    return undefined;
  };

  const selectedOption = getSelectedOption();

  return (
    <div className={`flex flex-col gap-1.5 relative min-w-[120px] ${className}`} ref={dropdownRef}>
      <label className="text-[11px] tracking-[0.06em] uppercase text-ink-soft font-medium">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="font-jost flex items-center justify-between border border-[rgba(42,36,32,0.1)] bg-cream rounded-lg px-3 py-2 text-[13px] text-ink outline-none w-full text-left focus:border-gold focus:shadow-[0_0_0_3px_rgba(184,146,79,0.12)] transition-all duration-200"
      >
        <span className="truncate flex items-center gap-1.5">
          <span>{selectedOption ? selectedOption.label : value}</span>
          {selectedOption?.isOtpRequired && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 border border-amber-500/30">
              🛡️Secured
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-[14px] h-[14px] text-ink-soft transition-transform duration-200 ml-2 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full min-w-[180px] bg-white border border-[rgba(42,36,32,0.1)] rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-1.5 border-b border-[rgba(42,36,32,0.08)] px-2.5 py-1.5 bg-cream/40">
            <Search className="w-3.5 h-3.5 text-ink-soft shrink-0" />
            <input
              type="text"
              placeholder={`Search ${label}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-[12px] text-ink outline-none placeholder:text-ink-soft/60"
              autoFocus
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1 text-[13px]">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 hover:bg-amber-100/30 transition-colors font-medium text-left ${
                        isSelected ? "text-gold bg-amber-50 font-semibold" : "text-ink"
                      }`}
                    >
                      <span className="truncate">{option.label}</span>
                      {option.isOtpRequired && (
                        option.isUnlocked ? (
                          <span className="ml-2 inline-flex items-center gap-1 shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                            🔓 Unlocked
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center gap-1 shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 border border-amber-500/30">
                            🔒 Protected
                          </span>
                        )
                      )}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-2 text-[12px] text-ink-soft italic text-center">
                No matching options
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

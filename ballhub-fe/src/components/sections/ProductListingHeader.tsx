"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { sortOptions } from "@/data/filter-options";

interface ProductListingHeaderProps {
  totalProducts: number;
  onSortChange?: (sortId: string) => void;
}

export function ProductListingHeader({
  totalProducts,
  onSortChange,
}: ProductListingHeaderProps) {
  const [activeSortId, setActiveSortId] = useState("newest");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeSortLabel =
    sortOptions.find((opt) => opt.id === activeSortId)?.label || "Mới nhất";

  const handleSortChange = (sortId: string) => {
    setActiveSortId(sortId);
    setIsDropdownOpen(false);
    // TODO: Gọi API sắp xếp sản phẩm
    onSortChange?.(sortId);
    console.log("Sorting by:", sortId);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200">
      {/* Left: Title and Count */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          Tất cả sản phẩm
        </h1>
        <p className="text-sm text-neutral-600">
          {totalProducts.toLocaleString("vi-VN")} kết quả
        </p>
      </div>

      {/* Right: Sort Dropdown */}
      <div className="relative w-full sm:w-auto">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2 bg-neutral-100 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-semibold text-neutral-700"
        >
          <span>Sắp xếp: {activeSortLabel}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-full sm:w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 overflow-hidden">
            {sortOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSortChange(option.id)}
                className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                  activeSortId === option.id
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

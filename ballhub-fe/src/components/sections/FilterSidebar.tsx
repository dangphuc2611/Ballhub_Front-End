"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { categories, sizes, teams, priceRange } from "@/data/filter-options";

interface FilterState {
  categories: string[];
  sizes: string[];
  teams: string[];
  priceMin: number;
  priceMax: number;
}

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterState) => void;
}

export function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    sizes: [],
    teams: [],
    priceMin: priceRange.min,
    priceMax: priceRange.max,
  });

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    size: true,
    team: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCheckboxChange = (
    type: "categories" | "sizes" | "teams",
    id: string,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter((item) => item !== id)
        : [...prev[type], id],
    }));
  };

  const handlePriceChange = (type: "min" | "max", value: number) => {
    setFilters((prev) => ({
      ...prev,
      [type === "min" ? "priceMin" : "priceMax"]: value,
    }));
  };

  const applyFilters = () => {
    // TODO: Gọi API với các filter đã chọn
    onFilterChange?.(filters);
    console.log("Applying filters:", filters);
  };

  const resetFilters = () => {
    setFilters({
      categories: [],
      sizes: [],
      teams: [],
      priceMin: priceRange.min,
      priceMax: priceRange.max,
    });
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm h-fit sticky top-20">
      {/* Header */}
      <h2 className="text-lg font-bold text-neutral-900 mb-6">Lọc sản phẩm</h2>

      {/* Categories Filter */}
      <div className="mb-6 border-b border-neutral-200 pb-6">
        <button
          onClick={() => toggleSection("category")}
          className="flex items-center justify-between w-full mb-4"
        >
          <h3 className="font-semibold text-neutral-800">Danh mục</h3>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${expandedSections.category ? "rotate-180" : ""}`}
          />
        </button>
        {expandedSections.category && (
          <div className="space-y-3">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat.id)}
                  onChange={() => handleCheckboxChange("categories", cat.id)}
                  className="w-4 h-4 rounded border-neutral-300 text-blue-600 cursor-pointer"
                />
                <span className="text-sm text-neutral-700">{cat.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="mb-6 border-b border-neutral-200 pb-6">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full mb-4"
        >
          <h3 className="font-semibold text-neutral-800">Khoảng giá</h3>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${expandedSections.price ? "rotate-180" : ""}`}
          />
        </button>
        {expandedSections.price && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-neutral-600 mb-2 block">Từ</label>
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                value={filters.priceMin}
                onChange={(e) =>
                  handlePriceChange("min", Number(e.target.value))
                }
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-sm font-semibold text-neutral-800 mt-2">
                {filters.priceMin.toLocaleString("vi-VN")}₫
              </p>
            </div>
            <div>
              <label className="text-xs text-neutral-600 mb-2 block">Đến</label>
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                value={filters.priceMax}
                onChange={(e) =>
                  handlePriceChange("max", Number(e.target.value))
                }
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-sm font-semibold text-neutral-800 mt-2">
                {filters.priceMax.toLocaleString("vi-VN")}₫
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Size Filter */}
      <div className="mb-6 border-b border-neutral-200 pb-6">
        <button
          onClick={() => toggleSection("size")}
          className="flex items-center justify-between w-full mb-4"
        >
          <h3 className="font-semibold text-neutral-800">Kích cỡ</h3>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${expandedSections.size ? "rotate-180" : ""}`}
          />
        </button>
        {expandedSections.size && (
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <label
                key={size.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.sizes.includes(size.id)}
                  onChange={() => handleCheckboxChange("sizes", size.id)}
                  className="w-3 h-3 rounded border-neutral-300 text-blue-600 cursor-pointer"
                />
                <span className="text-sm text-neutral-700">{size.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Team Filter */}
      <div className="mb-6 border-b border-neutral-200 pb-6">
        <button
          onClick={() => toggleSection("team")}
          className="flex items-center justify-between w-full mb-4"
        >
          <h3 className="font-semibold text-neutral-800">Đội bóng</h3>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${expandedSections.team ? "rotate-180" : ""}`}
          />
        </button>
        {expandedSections.team && (
          <div className="space-y-3">
            {teams.map((team) => (
              <label
                key={team.id}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.teams.includes(team.id)}
                  onChange={() => handleCheckboxChange("teams", team.id)}
                  className="w-4 h-4 rounded border-neutral-300 text-blue-600 cursor-pointer"
                />
                <span className="text-sm text-neutral-700">{team.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Apply Filters Button */}
      <button
        onClick={applyFilters}
        className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mb-2"
      >
        Áp dụng lọc
      </button>

      {/* Reset Button */}
      <button
        onClick={resetFilters}
        className="w-full py-2 px-4 bg-neutral-100 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-200 transition-colors text-sm"
      >
        Xóa bộ lọc
      </button>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { FilterSidebar } from "@/components/sections/FilterSidebar";
import { ProductListCard } from "@/components/sections/ProductListCard";
import { ProductListingHeader } from "@/components/sections/ProductListingHeader";
import { Pagination } from "@/components/sections/Pagination";
import { Breadcrumb } from "@/components/sections/Breadcrumb";
import { products } from "@/data/products-listing";

const ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState({
    categories: [],
    sizes: [],
    teams: [],
    priceMin: 500000,
    priceMax: 1500000,
  });

  // TODO: Thay bằng dữ liệu từ API backend
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Apply filters
    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category));
    }

    if (filters.teams.length > 0) {
      result = result.filter((p) =>
        filters.teams.some((team) =>
          p.team.toLowerCase().includes(team.replace("-", " ").toLowerCase()),
        ),
      );
    }

    if (filters.sizes.length > 0) {
      result = result.filter((p) =>
        p.size.some((s) => filters.sizes.includes(s)),
      );
    }

    result = result.filter(
      (p) => p.price >= filters.priceMin && p.price <= filters.priceMax,
    );

    // Apply sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      // Default: sort by ID (assuming newer products have higher IDs)
      result.sort((a, b) => Number(b.id) - Number(a.id));
    }

    return result;
  }, [filters, sortBy]);

  const totalPages = Math.ceil(
    filteredAndSortedProducts.length / ITEMS_PER_PAGE,
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedProducts = filteredAndSortedProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Danh sách sản phẩm" },
          ]}
        />

        {/* Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Filter Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar onFilterChange={setFilters} />
          </div>

          {/* Right: Product Grid */}
          <div className="lg:col-span-3">
            {/* Header with Sort */}
            <ProductListingHeader
              totalProducts={filteredAndSortedProducts.length}
              onSortChange={setSortBy}
            />

            {/* Product Grid */}
            {displayedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
                  {displayedProducts.map((product) => (
                    <ProductListCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-neutral-600">
                  Không tìm thấy sản phẩm phù hợp
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/**
 * useFormOptions — hook lấy data dropdown (brands, categories, sizes, colors) từ API
 * Dùng cho form thêm/sửa sản phẩm admin
 */
"use client";

import { useEffect, useState } from "react";

const BACKEND = "http://localhost:8080";

export interface SelectOption {
  value: string;
  label: string;
}

interface FormOptionsResult {
  brands: SelectOption[];
  categories: SelectOption[];
  sizes: SelectOption[];
  colors: SelectOption[];
  materials: SelectOption[];
  styles: SelectOption[];
  loading: boolean;
  error: string | null;
}

async function fetchJson(url: string, token?: string | null) {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  // Support both { data: [...] } and direct array
  return json?.data ?? json ?? [];
}

export function useFormOptions(): FormOptionsResult {
  const [brands, setBrands] = useState<SelectOption[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [sizes, setSizes] = useState<SelectOption[]>([]);
  const [colors, setColors] = useState<SelectOption[]>([]);
  const [materials, setMaterials] = useState<SelectOption[]>([]);
  const [styles, setStyles] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ ĐÃ SỬA: Đổi accessToken thành refreshToken
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("refreshToken")
        : null;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [rawBrands, rawCategories, rawSizes, rawColors, rawMaterials, rawStyles] =
          await Promise.all([
            fetchJson(`${BACKEND}/api/brands`, token),
            fetchJson(`${BACKEND}/api/categories`, token),
            fetchJson(`${BACKEND}/api/sizes`, token),
            fetchJson(`${BACKEND}/api/colors`, token),
            fetchJson(`${BACKEND}/api/materials`, token),
            fetchJson(`${BACKEND}/api/styles`, token),
          ]);

        setBrands(
          (rawBrands as any[]).map((b) => ({
            value: String(b.brandId),
            label: b.brandName,
          }))
        );

        // Flatten category tree → flat list (dfs)
        const flattenCategories = (
          list: any[],
          prefix = ""
        ): SelectOption[] => {
          const result: SelectOption[] = [];
          for (const c of list) {
            const label = prefix ? `${prefix} › ${c.categoryName}` : c.categoryName;
            result.push({ value: String(c.categoryId), label });
            if (c.children?.length) {
              result.push(...flattenCategories(c.children, label));
            }
          }
          return result;
        };

        setCategories(flattenCategories(rawCategories as any[]));

        setSizes(
          (rawSizes as any[]).map((s) => ({
            value: String(s.sizeId),
            label: s.sizeName,
          }))
        );

        setColors(
          (rawColors as any[]).map((c) => ({
            value: String(c.colorId),
            label: c.colorName,
          }))
        );

        setMaterials(
          (rawMaterials as any[]).map((m) => ({
            value: String(m.materialId),
            label: m.materialName,
          }))
        );

        setStyles(
          (rawStyles as any[]).map((s) => ({
            value: String(s.styleId),
            label: s.styleName,
          }))
        );
      } catch (e: any) {
        setError("Không thể tải dữ liệu danh mục / thương hiệu / size / màu / chất liệu / kiểu dáng");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { brands, categories, sizes, colors, materials, styles, loading, error };
}

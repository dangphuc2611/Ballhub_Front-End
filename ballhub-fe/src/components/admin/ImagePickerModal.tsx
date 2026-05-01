"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  X,
  Search,
  CheckCircle2,
  ImageOff,
  Loader2,
  FolderOpen,
  ChevronRight,
  Images,
  Star,
} from "lucide-react";
import { API_URL, API_BASE_URL, getImageUrl } from "@/config/env";



interface ImagePickerModalProps {
  /** Called when user confirms selection; receives list of chosen URL paths */
  onConfirm: (selectedUrls: string[], setFirstAsMain: boolean) => void;
  onClose: () => void;
  title?: string; // Tên hiển thị thêm context, vd: "Đang chọn ảnh cho: Size 40 / Đỏ"
  multiple?: boolean;
}

export const ImagePickerModal = ({ onConfirm, onClose, title, multiple = true }: ImagePickerModalProps) => {
  const [allImages, setAllImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [setFirstAsMain, setSetFirstAsMain] = useState(true);

  // ── Fetch image list from backend ──────────────────────────────────────────
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("refreshToken");
        const res = await fetch(`${API_URL}/admin/images/static`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const list: string[] = json?.data ?? json ?? [];
        setAllImages(list);
      } catch (e: any) {
        setError("Không thể tải danh sách ảnh.");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  // ── Derive unique top-level folders ────────────────────────────────────────
  const folders = useMemo(() => {
    const set = new Set<string>();
    allImages.forEach((url) => {
      const parts = url.replace(/^\/img\//, "").split("/");
      if (parts.length > 1) set.add(parts[0]);
    });
    return ["all", ...Array.from(set).sort()];
  }, [allImages]);

  // ── Filter images by folder + search ───────────────────────────────────────
  const visibleImages = useMemo(() => {
    let list = allImages;
    if (activeFolder !== "all") {
      list = list.filter((url) => url.includes(`/${activeFolder}/`));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((url) => url.toLowerCase().includes(q));
    }
    return list;
  }, [allImages, activeFolder, search]);

  // ── Toggle image selection ──────────────────────────────────────────────────
  const toggle = useCallback((url: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        if (!multiple) {
          next.clear();
        }
        next.add(url);
      }
      return next;
    });
  }, [multiple]);

  const selectAll = () => setSelected(new Set(visibleImages));
  const clearAll = () => setSelected(new Set());

  const handleConfirm = () => {
    onConfirm(Array.from(selected), setFirstAsMain);
    onClose();
  };

  // ── Folder label helper ─────────────────────────────────────────────────────
  const folderLabel = (f: string) =>
    f === "all" ? "Tất cả" : f.charAt(0).toUpperCase() + f.slice(1);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Images className="text-emerald-500" size={22} />
            <h2 className="font-black text-slate-800 text-lg">
              {title ? title : "Thư viện ảnh"}
            </h2>
            <span className="text-xs bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full">
              {allImages.length} ảnh
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Sidebar: folders ── */}
          <aside className="w-44 border-r border-slate-100 flex flex-col gap-1 p-3 overflow-y-auto shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">
              Thư mục
            </p>
            {folders.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFolder(f)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all text-left ${
                  activeFolder === f
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-100"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FolderOpen size={14} />
                {folderLabel(f)}
              </button>
            ))}
          </aside>

          {/* ── Main panel ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <div className="relative flex-1 max-w-xs">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                  size={15}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm ảnh..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
                />
              </div>
              <button
                onClick={selectAll}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Chọn tất cả
              </button>
              <button
                onClick={clearAll}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Bỏ chọn
              </button>
              {selected.size > 0 && (
                <span className="ml-auto text-xs font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-full">
                  {selected.size} đã chọn
                </span>
              )}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                  <Loader2 className="animate-spin" size={28} />
                  <p className="text-sm">Đang tải danh sách ảnh...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-red-400">
                  <ImageOff size={32} />
                  <p className="text-sm font-semibold">{error}</p>
                </div>
              ) : visibleImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                  <ImageOff size={32} />
                  <p className="text-sm">Không tìm thấy ảnh nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {visibleImages.map((url) => {
                    const isSelected = selected.has(url);
                    const fileName = url.split("/").pop() ?? url;
                    return (
                      <button
                        key={url}
                        onClick={() => toggle(url)}
                        className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 focus:outline-none ${
                          isSelected
                            ? "border-emerald-500 shadow-lg shadow-emerald-100 scale-[0.97]"
                            : "border-slate-100 hover:border-emerald-300 hover:scale-[0.98]"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(url)}
                          alt={fileName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='28' fill='%23cbd5e1'%3E%3F%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        {/* Overlay on hover/selected */}
                        <div
                          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
                            isSelected
                              ? "bg-emerald-500/25"
                              : "bg-transparent group-hover:bg-slate-900/10"
                          }`}
                        />
                        {/* Check badge */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                            <CheckCircle2 size={12} className="text-white" />
                          </div>
                        )}
                        {/* Filename tooltip */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-[9px] font-medium truncate">{fileName}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={setFirstAsMain}
              onChange={(e) => setSetFirstAsMain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
              <Star size={14} className="text-amber-400" />
              Đặt ảnh đầu tiên làm ảnh chính
            </span>
          </label>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-slate-500 font-bold text-sm bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={selected.size === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <ChevronRight size={16} />
              Xác nhận ({selected.size} ảnh)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

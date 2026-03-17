"use client";

import React from "react";
import { X, AlertTriangle, HelpCircle, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info" | "success";
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const ConfirmModal = ({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  variant = "warning",
  loading = false,
  onClose,
  onConfirm,
}: Props) => {
  if (!open) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          bg: "bg-rose-50",
          item: "text-rose-500",
          btn: "bg-rose-500 hover:bg-rose-600 shadow-rose-100",
          icon: <AlertTriangle size={32} />,
        };
      case "success":
        return {
          bg: "bg-emerald-50",
          item: "text-emerald-500",
          btn: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100",
          icon: <HelpCircle size={32} />,
        };
      case "info":
        return {
          bg: "bg-blue-50",
          item: "text-blue-500",
          btn: "bg-blue-500 hover:bg-blue-600 shadow-blue-100",
          icon: <HelpCircle size={32} />,
        };
      default:
        return {
          bg: "bg-amber-50",
          item: "text-amber-500",
          btn: "bg-amber-500 hover:bg-amber-600 shadow-amber-100",
          icon: <AlertTriangle size={32} />,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className={`w-16 h-16 ${styles.bg} ${styles.item} rounded-full flex items-center justify-center mx-auto mb-6`}>
            {styles.icon}
          </div>

          <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
          <div className="text-sm text-slate-500 font-medium leading-relaxed px-2">
            {description}
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3.5 border-2 border-slate-100 text-slate-500 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 ${styles.btn} text-white rounded-2xl text-sm font-bold transition-all active:scale-95 shadow-lg disabled:opacity-50`}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

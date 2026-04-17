"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Eye,
  Loader2,
  Search,
  Users,
  Tag,
  Palette,
  Briefcase,
  MessageSquare,
  Store,
  Layers,
  RefreshCw,
  Zap // ✅ Import icon tia chớp cho Khuyến mãi
} from "lucide-react"; // Đã bỏ import Bell

import { NavItem } from "@/components/admin/NavItem";
import { ProductTable } from "@/components/admin/ProductTable";
import { QuickAddProduct } from "@/components/admin/QuickAddProduct";
import { OrderTable } from "@/components/admin/OrderTable";
import { UserTable } from "@/components/admin/UserTable";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { ProductEditModal } from "@/components/admin/ProductEditModal";
import { OrderDetailModal } from "@/components/admin/OrderDetailModal";
import { VoucherTable } from "@/components/admin/VoucherTable";
import { VoucherModal } from "@/components/admin/VoucherModal";
import { ColorTable } from "@/components/admin/ColorTable";
import { ColorModal } from "@/components/admin/ColorModal";
import { BrandTable } from "@/components/admin/BrandTable";
import { BrandModal } from "@/components/admin/BrandModal";
import { ReviewTable } from "@/components/admin/ReviewTable";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { PosView } from "@/components/admin/PosView";
import { GlobalVariantTable } from "@/components/admin/GlobalVariantTable";
import { VariantEditModal } from "@/components/admin/VariantEditModal";
import { VariantCreateModal } from "@/components/admin/VariantCreateModal";
import { PromotionTable } from "@/components/admin/PromotionTable";
import { PromotionModal } from "@/components/admin/PromotionModal";

import { toast } from "sonner";
import axios from "axios";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Tổng quan");
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  
  const [productsDataFetch, setProductsDataFetch] = useState<any[]>([]);
  const [productPage, setProductPage] = useState<number>(0);
  const [productPageInfo, setProductPageInfo] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderPage, setOrderPage] = useState<number>(0);
  const [orderPageInfo, setOrderPageInfo] = useState<any>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [orderRefreshTrigger, setOrderRefreshTrigger] = useState(0);

  const [users, setUsers] = useState<any[]>([]);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userRefreshTrigger, setUserRefreshTrigger] = useState(0);

  // 🚀 State cho Tìm kiếm nhanh đơn hàng
  const [quickSearch, setQuickSearch] = useState("");

  // ── Voucher state 
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [voucherPage, setVoucherPage] = useState<number>(0);
  const [voucherPageInfo, setVoucherPageInfo] = useState<any>(null);
  const [voucherRefreshTrigger, setVoucherRefreshTrigger] = useState(0);
  const [voucherModal, setVoucherModal] = useState<{ open: boolean; mode: "view" | "create" | "edit"; voucher?: any; }>({ open: false, mode: "create" });

  // ✅ KHUYẾN MÃI (FLASH SALE) STATE
  const [promotions, setPromotions] = useState<any[]>([]);
  const [promotionPage, setPromotionPage] = useState<number>(0);
  const [promotionPageInfo, setPromotionPageInfo] = useState<any>(null);
  const [promotionRefreshTrigger, setPromotionRefreshTrigger] = useState(0);
  const [promotionModal, setPromotionModal] = useState<{ open: boolean; mode: "create" | "edit"; promotionData?: any; }>({ open: false, mode: "create" });

  // ── Color state 
  const [colors, setColors] = useState<any[]>([]);
  const [colorPage, setColorPage] = useState<number>(0);
  const [colorPageInfo, setColorPageInfo] = useState<any>(null);
  const [colorRefreshTrigger, setColorRefreshTrigger] = useState(0);
  const [colorModal, setColorModal] = useState<{ open: boolean; mode: "create" | "edit"; colorData?: any; }>({ open: false, mode: "create" });

  // ── Brand state 
  const [brands, setBrands] = useState<any[]>([]);
  const [brandPage, setBrandPage] = useState<number>(0);
  const [brandPageInfo, setBrandPageInfo] = useState<any>(null);
  const [brandRefreshTrigger, setBrandRefreshTrigger] = useState(0);
  const [brandModal, setBrandModal] = useState<{ open: boolean; mode: "create" | "edit"; brandData?: any; }>({ open: false, mode: "create" });

  // ── Review state 
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewPage, setReviewPage] = useState<number>(0);
  const [reviewPageInfo, setReviewPageInfo] = useState<any>(null);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);

  // ── Global Variant state
  const [globalVariants, setGlobalVariants] = useState<any[]>([]);
  const [variantPage, setVariantPage] = useState<number>(0);
  const [variantPageInfo, setVariantPageInfo] = useState<any>(null);
  const [variantRefreshTrigger, setVariantRefreshTrigger] = useState(0);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [showVariantCreate, setShowVariantCreate] = useState(false);

  // ── Global Confirm state
  const [confirmConfig, setConfirmConfig] = useState<any>({ open: false, title: "", description: "", onConfirm: () => {}, variant: "warning" });

  const askConfirm = (title: string, description: string, onConfirm: () => void, variant: any = "danger") => {
    setConfirmConfig({ open: true, title, description, onConfirm, variant });
  };

  const handleGlobalRefresh = () => {
    switch (activeTab) {
      case "Sản phẩm": setRefreshTrigger(p => p + 1); break;
      case "Đơn hàng": setOrderRefreshTrigger(p => p + 1); break;
      case "Người dùng": setUserRefreshTrigger(p => p + 1); break;
      case "Voucher": setVoucherRefreshTrigger(p => p + 1); break;
      case "Khuyến mãi": setPromotionRefreshTrigger(p => p + 1); break;
      case "Màu sắc": setColorRefreshTrigger(p => p + 1); break;
      case "Hãng quần áo": setBrandRefreshTrigger(p => p + 1); break;
      case "Đánh giá": setReviewRefreshTrigger(p => p + 1); break;
      case "Biến thể": setVariantRefreshTrigger(p => p + 1); break;
    }
    toast.success(`Đã làm mới dữ liệu: ${activeTab}`);
  };

  // 🚀 Logic Tìm kiếm nhanh (Quét Đơn Hàng)
  const handleQuickSearchAction = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const val = quickSearch.trim().replace(/^#?(BH-|HD)/i, ""); // Lọc bỏ text thừa
      
      if (/^\d+$/.test(val)) {
        setSelectedOrderId(Number(val));
        setQuickSearch(""); // Reset ô input sau khi bấm
      } else {
        toast.info("Vui lòng nhập Mã đơn hàng (ví dụ: 5 hoặc HD-5) để tra cứu nhanh.");
      }
    }
  };

  // FETCH SẢN PHẨM
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("refreshToken");
        const res = await fetch(`http://localhost:8080/api/products?page=${productPage}`, { headers: { Authorization: `Bearer ${token}` } });
        const result = await res.json();
        const payload = result?.data ?? result;
        setProductsDataFetch(payload?.content ?? []);
        setProductPageInfo({
          pageNumber: payload?.pageNumber ?? 0, pageSize: payload?.pageSize ?? 12,
          totalElements: payload?.totalElements ?? 0, totalPages: payload?.totalPages ?? 1,
        });
      } catch (error) {}
    };
    fetchProducts();
  }, [productPage, refreshTrigger]);

  // FETCH ĐƠN HÀNG
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("refreshToken");
        const res = await fetch(`http://localhost:8080/api/orders/admin/all?page=${orderPage}`, { headers: { Authorization: `Bearer ${token}` } });
        const result = await res.json();
        const payload = result?.data ?? result;
        setOrders(payload?.content ?? []);
        setOrderPageInfo({
          pageNumber: payload?.pageNumber ?? 0, pageSize: payload?.pageSize ?? 10,
          totalElements: payload?.totalElements ?? 0, totalPages: payload?.totalPages ?? 1,
        });
      } catch (error) {}
    };
    fetchOrders();
  }, [orderPage, orderRefreshTrigger]);

  // FETCH USER
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("refreshToken");
        const res = await fetch("http://localhost:8080/api/admin/stats/users", { headers: { Authorization: `Bearer ${token}` } });
        const result = await res.json();
        setUsers(result?.data ?? result ?? []);
      } catch (error) {}
    };
    fetchUsers();
  }, [userRefreshTrigger]);

  // FETCH VOUCHER
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const token = localStorage.getItem("refreshToken");
        const res = await fetch(`http://localhost:8080/api/promotions/admin/all?page=${voucherPage}&size=100`, { headers: { Authorization: `Bearer ${token}` } });
        const result = await res.json();
        const payload = result?.data ?? result;
        
        // 🚀 BỔ SUNG LỌC: Chỉ lấy những Promotion có promoCode (khác null và khác rỗng)
        const validVouchers = (payload?.content ?? []).filter((v: any) => v.promoCode && v.promoCode.trim() !== "");

        setVouchers(validVouchers);
        setVoucherPageInfo({
          pageNumber: payload?.pageNumber ?? 0, 
          pageSize: payload?.pageSize ?? 10,
          totalElements: validVouchers.length, // Lấy theo độ dài mảng đã lọc
          totalPages: payload?.totalPages ?? 1,
        });
      } catch (err) {}
    };
    fetchVouchers();
  }, [voucherPage, voucherRefreshTrigger]);

  // ✅ FETCH KHUYẾN MÃI (FLASH SALE)
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const token = localStorage.getItem("refreshToken");
        const res = await fetch(`http://localhost:8080/api/promotions/admin/all?page=0&size=100`, { headers: { Authorization: `Bearer ${token}` } });
        const result = await res.json();
        const payload = result?.data ?? result;
        
        // Lọc ra những chương trình KHÔNG có promoCode
        const flashSales = (payload?.content ?? []).filter((p: any) => !p.promoCode);
        
        setPromotions(flashSales);
        setPromotionPageInfo({
          pageNumber: 0, pageSize: 100,
          totalElements: flashSales.length, totalPages: 1,
        });
      } catch (err) {}
    };
    fetchPromotions();
  }, [promotionPage, promotionRefreshTrigger]);

  const handleDeletePromotion = (id: number) => {
    askConfirm(
      "Xóa Khuyến mãi?",
      "Xóa chương trình này sẽ gỡ bỏ giảm giá khỏi tất cả sản phẩm đang áp dụng. Bạn có chắc chắn?",
      async () => {
        try {
          const token = localStorage.getItem("refreshToken");
          await fetch(`http://localhost:8080/api/promotions/admin/${id}`, {
            method: "DELETE", headers: { Authorization: `Bearer ${token}` },
          });
          setPromotionRefreshTrigger((p) => p + 1);
          setConfirmConfig((p: any) => ({ ...p, open: false }));
          toast.success("Đã xóa chương trình khuyến mãi");
        } catch (err) { toast.error("Lỗi khi xóa khuyến mãi"); }
      }
    );
  };

  const handleDeleteVoucher = (id: number) => {
    askConfirm("Xóa Voucher?", "Bạn có chắc chắn muốn xóa voucher này? Thao tác này không thể hoàn tác.", async () => {
        try {
          const token = localStorage.getItem("refreshToken");
          await fetch(`http://localhost:8080/api/promotions/admin/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
          setVoucherRefreshTrigger((p) => p + 1);
          setConfirmConfig((p: any) => ({ ...p, open: false }));
        } catch (err) {}
      }
    );
  };

  // FETCH COLORS, BRANDS, REVIEWS, VARIANTS
  useEffect(() => {
    const fetchColors = async () => {
      try {
        const token = localStorage.getItem("refreshToken");
        const res = await fetch(`http://localhost:8080/api/admin/colors?page=${colorPage}&size=10`, { headers: { Authorization: `Bearer ${token}` } });
        const result = await res.json();
        const payload = result?.data ?? result;
        setColors(payload?.content ?? []);
        setColorPageInfo({ pageNumber: payload?.pageNumber ?? 0, totalPages: payload?.totalPages ?? 1 });
      } catch (err) {}
    }; fetchColors();
  }, [colorPage, colorRefreshTrigger]);

  const handleDeleteColor = (id: number) => {
    askConfirm("Xóa Màu Sắc?", "Bạn có chắc chắn muốn xóa màu này không?", async () => {
        try {
          const token = localStorage.getItem("refreshToken");
          const res = await fetch(`http://localhost:8080/api/admin/colors/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
          const result = await res.json();
          if (result.status === "error") alert(result.message);
          else { setColorRefreshTrigger((p) => p + 1); setConfirmConfig((p: any) => ({ ...p, open: false })); }
        } catch (err) {}
      });
  };

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const token = localStorage.getItem("refreshToken");
        const res = await fetch(`http://localhost:8080/api/admin/brands?page=${brandPage}&size=10`, { headers: { Authorization: `Bearer ${token}` } });
        const result = await res.json();
        const payload = result?.data ?? result;
        setBrands(payload?.content ?? []);
        setBrandPageInfo({ pageNumber: payload?.pageNumber ?? 0, totalPages: payload?.totalPages ?? 1 });
      } catch (err) {}
    }; fetchBrands();
  }, [brandPage, brandRefreshTrigger]);

  const handleDeleteBrand = (id: number) => {
    askConfirm("Xóa Thương Hiệu?", "Bạn có chắc chắn muốn xóa thương hiệu này không?", async () => {
        try {
          const token = localStorage.getItem("refreshToken");
          const res = await fetch(`http://localhost:8080/api/admin/brands/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
          const result = await res.json();
          if (result.status === "error") alert(result.message);
          else { setBrandRefreshTrigger((p) => p + 1); setConfirmConfig((p: any) => ({ ...p, open: false })); }
        } catch (err) {}
      });
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem("refreshToken");
        const res = await fetch(`http://localhost:8080/api/admin/reviews?page=${reviewPage}&size=10`, { headers: { Authorization: `Bearer ${token}` } });
        const result = await res.json();
        const payload = result?.data ?? result;
        setReviews(payload?.content ?? []);
        setReviewPageInfo({ pageNumber: payload?.pageNumber ?? 0, totalPages: payload?.totalPages ?? 1 });
      } catch (err) {}
    }; fetchReviews();
  }, [reviewPage, reviewRefreshTrigger]);

  const handleDeleteReview = (id: number) => {
    askConfirm("Xóa Đánh Giá?", "Bạn có chắc chắn muốn xóa nhận xét này không?", async () => {
        try {
          const token = localStorage.getItem("refreshToken");
          const res = await fetch(`http://localhost:8080/api/admin/reviews/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
          const result = await res.json();
          if (result.status === "error") alert(result.message);
          else { setReviewRefreshTrigger((p) => p + 1); setConfirmConfig((p: any) => ({ ...p, open: false })); }
        } catch (err) {}
      });
  };

  useEffect(() => {
    const fetchAllVariants = async () => {
      try {
        const token = localStorage.getItem("refreshToken");
        const res = await fetch(`http://localhost:8080/api/admin/variants?page=${variantPage}&size=10`, { headers: { Authorization: `Bearer ${token}` } });
        const result = await res.json();
        const payload = result?.data ?? result;
        setGlobalVariants(payload?.content ?? []);
        setVariantPageInfo({ pageNumber: payload?.pageNumber ?? 0, totalPages: payload?.totalPages ?? 1,totalElements: payload?.totalElements ?? 0, pageSize: payload?.pageSize ?? 10});
      } catch (err) {}
    }; fetchAllVariants();
  }, [variantPage, variantRefreshTrigger]);

  const handleToggleVariantStatus = async (v: any) => {
    try {
      const token = localStorage.getItem("refreshToken"); 
      await axios.put(`http://localhost:8080/api/admin/variants/${v.variantId}`, { price: v.price, stockQuantity: v.stockQuantity, status: !v.status }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`${v.status ? "Ẩn" : "Hiện"} biến thể thành công`);
      setVariantRefreshTrigger((p) => p + 1);
    } catch (err) {}
  };

  const handleHardDeleteVariant = (id: number) => {
    askConfirm("Xóa Vĩnh Viễn Biến Thể?", "Thao tác này sẽ xóa hoàn toàn biến thể khỏi hệ thống. Bạn có chắc chắn?", async () => {
        try {
          const token = localStorage.getItem("refreshToken");
          await fetch(`http://localhost:8080/api/admin/variants/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
          setVariantRefreshTrigger((p) => p + 1);
          setConfirmConfig((p: any) => ({ ...p, open: false }));
          toast.success("Xóa biến thể thành công");
        } catch (err) {}
      });
  };

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (user.role !== "ADMIN") router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "ADMIN") {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-screen z-20">
        <div className="p-6 mb-4">
          <Link href="/" className="flex items-center gap-2 mb-8 group cursor-pointer transition-all active:scale-95">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white group-hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100">
              <Package size={18} />
            </div>
            <h1 className="font-bold text-xl text-slate-800 group-hover:text-emerald-600">BallHub</h1>
          </Link>

          <nav className="space-y-1">
            <NavItem icon={<LayoutDashboard size={18} />} label="Tổng quan" active={activeTab === "Tổng quan"} onClick={() => setActiveTab("Tổng quan")} />
            <NavItem icon={<Package size={18} />} label="Sản phẩm" active={activeTab === "Sản phẩm"} onClick={() => setActiveTab("Sản phẩm")} />
            <NavItem icon={<Layers size={18} />} label="Biến thể" active={activeTab === "Biến thể"} onClick={() => setActiveTab("Biến thể")} />
            <NavItem icon={<ShoppingCart size={18} />} label="Đơn hàng" active={activeTab === "Đơn hàng"} onClick={() => setActiveTab("Đơn hàng")} />
            <NavItem icon={<Store size={18} />} label="Bán tại quầy" active={activeTab === "Bán tại quầy"} onClick={() => setActiveTab("Bán tại quầy")} />
            <NavItem icon={<Users size={18} />} label="Người dùng" active={activeTab === "Người dùng"} onClick={() => setActiveTab("Người dùng")} />
            <NavItem icon={<Tag size={18} />} label="Voucher" active={activeTab === "Voucher"} onClick={() => setActiveTab("Voucher")} />
            
            <NavItem icon={<Zap size={18} />} label="Khuyến mãi" active={activeTab === "Khuyến mãi"} onClick={() => setActiveTab("Khuyến mãi")} />
            
            <NavItem icon={<Palette size={18} />} label="Màu sắc" active={activeTab === "Màu sắc"} onClick={() => setActiveTab("Màu sắc")} />
            <NavItem icon={<Briefcase size={18} />} label="Hãng quần áo" active={activeTab === "Hãng quần áo"} onClick={() => setActiveTab("Hãng quần áo")} />
            <NavItem icon={<MessageSquare size={18} />} label="Đánh giá" active={activeTab === "Đánh giá"} onClick={() => setActiveTab("Đánh giá")} />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-50">
          <div className="flex items-center gap-3 p-2 border border-slate-100 rounded-xl bg-slate-50/50">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs uppercase">{user.fullName?.charAt(0) || "A"}</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate text-slate-800">{user.fullName}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {activeTab === "Bán tại quầy" ? "Máy tính tiền (POS)" : "Dashboard Thống kê"}
            </h2>
            <p className="text-xs text-slate-400 font-medium">Chào mừng trở lại, {user.fullName}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
              <input 
                className="bg-white border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-xs w-64 shadow-sm outline-none focus:ring-2 ring-emerald-100 transition-all" 
                placeholder="Tra mã đơn nhanh + Enter..." 
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                onKeyDown={handleQuickSearchAction} // 🚀 Gắn sự kiện Enter
              />
            </div>
            <button onClick={handleGlobalRefresh} className="p-2 bg-white rounded-xl text-emerald-500 border border-emerald-100 shadow-sm hover:bg-emerald-50 hover:rotate-180 transition-all duration-500" title="Làm mới dữ liệu"><RefreshCw size={18} /></button>
            <button onClick={logout} className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all active:scale-95"><LogOut size={16} /> Đăng xuất</button>
          </div>
        </header>

        <div className="animate-in fade-in duration-500">
          {activeTab === "Tổng quan" && (
            <div className="space-y-8">
              <DashboardStats />
              <RevenueChart />
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6"><h3 className="font-black text-slate-800">Đơn hàng mới nhất</h3><button onClick={() => setActiveTab("Đơn hàng")} className="text-emerald-500 text-xs font-bold hover:underline">Xem tất cả →</button></div>
                <OrderTable orders={orders} page={orderPage} totalPages={orderPageInfo?.totalPages ?? 1} totalElements={orderPageInfo?.totalElements} pageSize={orderPageInfo?.pageSize} onPageChange={(p: number) => setOrderPage(p)} onView={(id: number) => setSelectedOrderId(id)} onRefresh={() => setOrderRefreshTrigger((p) => p + 1)} />
              </div>
            </div>
          )}

          {activeTab === "Sản phẩm" && (
            <div className="grid grid-cols-12 gap-6 items-start">
              <div className="col-span-8 space-y-8">
                <ProductTable products={productsDataFetch} page={productPage} totalPages={productPageInfo?.totalPages ?? 1} totalElements={productPageInfo?.totalElements} pageSize={productPageInfo?.pageSize} onPageChange={(p: number) => setProductPage(p)} onEdit={(id: number) => setEditingProductId(id)} />
              </div>
              <div className="col-span-4"><QuickAddProduct /></div>
            </div>
          )}

          {activeTab === "Biến thể" && (
            <div className="col-span-12">
              <GlobalVariantTable 
                variants={globalVariants} 
                page={variantPage} 
                totalPages={variantPageInfo?.totalPages ?? 1} 
                totalElements={variantPageInfo?.totalElements} 
                pageSize={variantPageInfo?.pageSize} 
                onPageChange={(p: number) => setVariantPage(p)} 
                onEdit={(v: any) => setEditingVariant(v)} 
                onToggleStatus={handleToggleVariantStatus} 
                onDelete={handleHardDeleteVariant} 
                onAddNew={() => setShowVariantCreate(true)} 
                onRefresh={() => setVariantRefreshTrigger(p => p + 1)}
              />
            </div>
          )}

          {activeTab === "Đơn hàng" && (
            <div className="grid grid-cols-12 gap-6 items-start">
              <div className="col-span-12"><OrderTable orders={orders} page={orderPage} totalPages={orderPageInfo?.totalPages ?? 1} totalElements={orderPageInfo?.totalElements} pageSize={orderPageInfo?.pageSize} onPageChange={(p: number) => setOrderPage(p)} onView={(id: number) => setSelectedOrderId(id)} onRefresh={() => setOrderRefreshTrigger((p) => p + 1)} /></div>
            </div>
          )}

          {activeTab === "Bán tại quầy" && <div className="col-span-12"><PosView /></div>}
          {activeTab === "Người dùng" && <div className="col-span-12"><UserTable users={users} onRefresh={() => setUserRefreshTrigger((p) => p + 1)} /></div>}

          {activeTab === "Voucher" && (
            <div className="col-span-12">
              <VoucherTable vouchers={vouchers} page={voucherPage} totalPages={voucherPageInfo?.totalPages ?? 1} totalElements={voucherPageInfo?.totalElements} pageSize={voucherPageInfo?.pageSize} onPageChange={(p: number) => setVoucherPage(p)} onView={(v: any) => setVoucherModal({ open: true, mode: "view", voucher: v })} onEdit={(v: any) => setVoucherModal({ open: true, mode: "edit", voucher: v })} onDelete={handleDeleteVoucher} onAddNew={() => setVoucherModal({ open: true, mode: "create" })} />
            </div>
          )}

          {activeTab === "Khuyến mãi" && (
            <div className="col-span-12">
              <PromotionTable
                promotions={promotions}
                page={promotionPage}
                totalPages={promotionPageInfo?.totalPages ?? 1}
                totalElements={promotionPageInfo?.totalElements}
                pageSize={promotionPageInfo?.pageSize}
                onPageChange={(p: number) => setPromotionPage(p)}
                onDelete={handleDeletePromotion}
                onEdit={(p) => setPromotionModal({ open: true, mode: "edit", promotionData: p })}
                onAddNew={() => setPromotionModal({ open: true, mode: "create" })}
              />
            </div>
          )}

          {activeTab === "Màu sắc" && <div className="col-span-12"><ColorTable colors={colors} page={colorPage} totalPages={colorPageInfo?.totalPages ?? 1} totalElements={colorPageInfo?.totalElements} pageSize={colorPageInfo?.pageSize} onPageChange={(p) => setColorPage(p)} onEdit={(c) => setColorModal({ open: true, mode: "edit", colorData: c })} onDelete={handleDeleteColor} onAddNew={() => setColorModal({ open: true, mode: "create" })} /></div>}
          {activeTab === "Hãng quần áo" && <div className="col-span-12"><BrandTable brands={brands} page={brandPage} totalPages={brandPageInfo?.totalPages ?? 1} totalElements={brandPageInfo?.totalElements} pageSize={brandPageInfo?.pageSize} onPageChange={(p: number) => setBrandPage(p)} onEdit={(b) => setBrandModal({ open: true, mode: "edit", brandData: b })} onDelete={handleDeleteBrand} onAddNew={() => setBrandModal({ open: true, mode: "create" })} /></div>}
          {activeTab === "Đánh giá" && <div className="col-span-12"><ReviewTable reviews={reviews} page={reviewPage} totalPages={reviewPageInfo?.totalPages ?? 1} totalElements={reviewPageInfo?.totalElements} pageSize={reviewPageInfo?.pageSize} onPageChange={(p: number) => setReviewPage(p)} onDelete={handleDeleteReview} /></div>}
        </div>
      </main>

      {/* MODALS */}
      {editingProductId !== null && <ProductEditModal productId={editingProductId} onClose={() => setEditingProductId(null)} onRefresh={() => setRefreshTrigger((p) => p + 1)} />}
      
      {/* 🚀 POPUP ĐƠN HÀNG ĐƯỢC GỌI Ở ĐÂY KHI CÓ selectedOrderId */}
      {selectedOrderId !== null && <OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} onRefresh={() => setOrderRefreshTrigger((p) => p + 1)} />}
      
      {voucherModal.open && <VoucherModal mode={voucherModal.mode} voucher={voucherModal.voucher} onClose={() => setVoucherModal({ open: false, mode: "create" })} onSuccess={() => setVoucherRefreshTrigger((p) => p + 1)} />}
      {colorModal.open && <ColorModal mode={colorModal.mode} open={colorModal.open} colorData={colorModal.colorData} onClose={() => setColorModal({ open: false, mode: "create" })} onRefresh={() => setColorRefreshTrigger((p) => p + 1)} />}
      {brandModal.open && <BrandModal mode={brandModal.mode} open={brandModal.open} brandData={brandModal.brandData} onClose={() => setBrandModal({ open: false, mode: "create" })} onRefresh={() => setBrandRefreshTrigger((p) => p + 1)} />}
      <ConfirmModal open={confirmConfig.open} title={confirmConfig.title} description={confirmConfig.description} variant={confirmConfig.variant} onClose={() => setConfirmConfig((p: any) => ({ ...p, open: false }))} onConfirm={confirmConfig.onConfirm} />
      {editingVariant && <VariantEditModal variant={editingVariant} onClose={() => setEditingVariant(null)} onSuccess={() => setVariantRefreshTrigger((p) => p + 1)} />}
      {showVariantCreate && <VariantCreateModal onClose={() => setShowVariantCreate(false)} onSuccess={() => setVariantRefreshTrigger((p) => p + 1)} />}
        {promotionModal.open && (
        <PromotionModal
          mode={promotionModal.mode}
          promotionData={promotionModal.promotionData}
          onClose={() => setPromotionModal({ open: false, mode: "create" })}
          onSuccess={() => setPromotionRefreshTrigger((p) => p + 1)}
        />
      )}
    </div>
  );
}
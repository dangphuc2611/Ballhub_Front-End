'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/app/context/AuthContext";
import { 
  LayoutDashboard, Package, ShoppingCart, 
  LogOut, Eye, Loader2, Search, Bell
} from 'lucide-react';

import { NavItem } from '@/components/admin/NavItem';
import { ProductTable } from '@/components/admin/ProductTable';
import { QuickAddProduct } from '@/components/admin/QuickAddProduct';
import { OrderTable } from '@/components/admin/OrderTable';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { RevenueChart } from '@/components/admin/RevenueChart';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // DỮ LIỆU MẪU
  const products: any[] = [
    { id: 1, name: "Áo Đấu Man Utd Home 23/24", sub: "Premier League", price: "350.000đ", stock: 45, status: "Còn hàng", color: "green" },
    { id: 2, name: "Áo Đấu Man City Away 23/24", sub: "Premier League", price: "320.000đ", stock: 12, status: "Còn hàng", color: "green" },
    { id: 3, name: "Áo Đấu Real Madrid Home", sub: "La Liga", price: "400.000đ", stock: 0, status: "Hết hàng", color: "red" },
  ];

  const orders: any[] = [
    { id: "#ORD-00125", customer: "Nguyễn Văn A", phone: "0901234567", date: "20/05/2024", total: "1.200.000đ", status: "Hoàn thành", color: "green" },
    { id: "#ORD-00124", customer: "Trần Thị B", phone: "0909876543", date: "19/05/2024", total: "950.000đ", status: "Chờ xử lý", color: "orange" },
    { id: "#ORD-00123", customer: "Lê Văn C", phone: "0912345678", date: "18/05/2024", total: "1.500.000đ", status: "Đang giao", color: "blue" },
  ];

  // LOGIC BẢO MẬT GIỮ NGUYÊN
  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/login');
      else if (user.role !== 'ADMIN') router.replace('/');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* SIDEBAR - GIỮ NGUYÊN */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-screen z-20">
        <div className="p-6 mb-4">
          <Link href="/" className="flex items-center gap-2 mb-8 group cursor-pointer transition-all active:scale-95">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white group-hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100">
              <Package size={18} />
            </div>
            <h1 className="font-bold text-xl text-slate-800 group-hover:text-emerald-600">BallHub</h1>
          </Link>

          <nav className="space-y-1">
            <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
            <NavItem icon={<Package size={18}/>} label="Sản phẩm" active={activeTab === 'Sản phẩm'} onClick={() => setActiveTab('Sản phẩm')} />
            <NavItem icon={<ShoppingCart size={18}/>} label="Đơn hàng" active={activeTab === 'Đơn hàng'} onClick={() => setActiveTab('Đơn hàng')} />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-50">
          <div className="flex items-center gap-3 p-2 border border-slate-100 rounded-xl bg-slate-50/50">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs uppercase">
              {user.fullName?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate text-slate-800">{user.fullName}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
             <h2 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard Thống kê</h2>
             <p className="text-xs text-slate-400 font-medium">Chào mừng trở lại, {user.fullName}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
              <input className="bg-white border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-xs w-64 shadow-sm outline-none focus:ring-2 ring-emerald-100 transition-all" placeholder="Tìm kiếm nhanh..." />
            </div>
            <button className="p-2 bg-white rounded-xl text-slate-400 border border-slate-100 shadow-sm relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button onClick={logout} className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all active:scale-95">
              <LogOut size={16}/> Đăng xuất
            </button>
          </div>
        </header>

        {/* NỘI DUNG TÙY THEO TAB */}
        <div className="animate-in fade-in duration-500">
          {activeTab === 'Dashboard' && (
            <div className="space-y-8">
              {/* 1. Thẻ số liệu */}
              <DashboardStats />
              
              {/* 2. Biểu đồ */}
              <RevenueChart />

              {/* 3. Đơn hàng mới nhất */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-slate-800">Đơn hàng mới nhất</h3>
                    <button onClick={() => setActiveTab('Đơn hàng')} className="text-emerald-500 text-xs font-bold hover:underline">Xem tất cả →</button>
                 </div>
                 <OrderTable orders={orders} />
              </div>
            </div>
          )}

          {activeTab === 'Sản phẩm' && (
            <div className="grid grid-cols-12 gap-6 items-start">
              <div className="col-span-8 space-y-8">
                <ProductTable products={products} />
                <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Lịch sử đơn hàng</h3>
                    <OrderTable orders={orders} />
                </div>
              </div>
              <div className="col-span-4">
                <QuickAddProduct />
              </div>
            </div>
          )}

          {activeTab === 'Đơn hàng' && (
            <div className="grid grid-cols-12 gap-6 items-start">
               <div className="col-span-12">
                  <OrderTable orders={orders} />
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Search, X, User as UserIcon, Phone } from "lucide-react";
import { toast } from "sonner";
import { usePosStore } from "@/lib/usePosStore";

interface PosCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Customer {
  userId: number;
  fullName: string;
  phone: string;
  email: string;
}

export const PosCustomerModal = ({ isOpen, onClose }: PosCustomerModalProps) => {
  const [keyword, setKeyword] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { updateActiveOrderDetails } = usePosStore();

  const fetchCustomers = async (searchKw: string = "") => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("refreshToken");
      const res = await fetch(`http://localhost:8080/api/users/admin/search?keyword=${encodeURIComponent(searchKw)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      
      if (result.success) {
        setCustomers(result.data);
      }
    } catch (error) {
      console.error("Lỗi fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setKeyword("");
      fetchCustomers(""); // Lấy toàn bộ danh sách khi vừa mở
    }
  }, [isOpen]);

  const handleSearch = () => {
    fetchCustomers(keyword);
  };

  // Hàm chọn khách hàng: Bấm 1 phát là ăn ngay!
  const handleSelectCustomer = (customer: Customer) => {
    updateActiveOrderDetails({
      customerId: customer.userId,
      customerName: customer.fullName,
      customerPhone: customer.phone,
      // Reset trạng thái giao hàng về mặc định
      isDelivery: false,
      addressId: null,
      deliveryAddress: "",
      shippingFee: 0
    });
    toast.success(`Đã chọn khách hàng: ${customer.fullName}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh] animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-800">
            Chọn khách hàng
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
          <div className="space-y-5">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Nhập tên, số điện thoại hoặc email..." 
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-medium shadow-sm transition-all"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  autoFocus
                />
              </div>
              <button 
                onClick={handleSearch} 
                disabled={isLoading}
                className="bg-emerald-500 text-white px-8 rounded-2xl font-bold hover:bg-emerald-600 shadow-md shadow-emerald-200 transition-all disabled:opacity-70"
              >
                {isLoading ? '...' : 'TÌM KIẾM'}
              </button>
            </div>

            {/* LIST CUSTOMERS */}
            <div className="space-y-3">
              {isLoading && customers.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 animate-pulse font-bold uppercase tracking-widest text-xs">Đang tải danh sách...</div>
              ) : customers.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 font-medium">Không tìm thấy khách hàng nào.</div>
              ) : (
                  customers.map((c) => (
                    <div 
                      key={c.userId} 
                      onClick={() => handleSelectCustomer(c)}
                      className="flex items-center p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all group"
                    >
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mr-4 group-hover:bg-emerald-100 transition-colors">
                        <UserIcon size={24} />
                      </div>
                      <div className="flex flex-col">
                        <p className="font-bold text-slate-800 text-[15px]">{c.fullName}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><Phone size={12}/> {c.phone || "Chưa có SĐT"}</span>
                          <span className="text-slate-300">|</span>
                          <span>{c.email}</span>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
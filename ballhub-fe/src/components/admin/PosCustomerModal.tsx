"use client";

import { useState, useEffect } from "react";
import { Search, X, User as UserIcon, Phone, UserPlus, ArrowLeft, Save, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { usePosStore } from "@/lib/usePosStore";
import api from "@/lib/axios"; // Giả sử bạn dùng instance axios này

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
  // --- States cho tìm kiếm ---
  const [keyword, setKeyword] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- States cho tạo nhanh tài khoản ---
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "123456",
  });

  const { updateActiveOrderDetails } = usePosStore();

  const fetchCustomers = async (searchKw: string = "") => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("refreshToken");
      const res = await fetch(`http://localhost:8080/api/users/admin/search?keyword=${encodeURIComponent(searchKw)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) setCustomers(result.data);
    } catch (error) {
      console.error("Lỗi fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setKeyword("");
      setShowQuickRegister(false);
      fetchCustomers("");
    }
  }, [isOpen]);

  const handleSearch = () => fetchCustomers(keyword);

  const handleSelectCustomer = (customer: Customer) => {
    updateActiveOrderDetails({
      customerId: customer.userId,
      customerName: customer.fullName,
      customerPhone: customer.phone,
      isDelivery: false,
      addressId: null,
      deliveryAddress: "",
      shippingFee: 0
    });
    toast.success(`Đã chọn khách hàng: ${customer.fullName}`);
    onClose();
  };

  // 🚀 LOGIC TẠO TÀI KHOẢN NHANH
  const handleQuickRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (!formData.fullName || !formData.phone) {
      toast.error("Vui lòng nhập tên và số điện thoại");
      return;
    }

    setIsSubmitting(true);
    try {
      // Gọi API tạo tài khoản
      const res = await api.post("/auth/register", formData);
      
      if (res.data.success) {
        toast.success("Tạo tài khoản khách hàng thành công!");
        
        // 1. Đóng form đăng ký
        setShowQuickRegister(false);
        
        // 2. Đẩy luôn SĐT vừa tạo ra ô tìm kiếm bên ngoài cho tiện
        setKeyword(formData.phone);
        
        // 3. Tự động load lại danh sách tìm kiếm với SĐT đó
        fetchCustomers(formData.phone);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Số điện thoại hoặc email đã tồn tại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl flex flex-col overflow-hidden max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {showQuickRegister && (
              <button 
                onClick={() => setShowQuickRegister(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-500"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-xl font-black text-slate-800">
              {showQuickRegister ? "Tạo tài khoản khách" : "Chọn khách hàng"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30 custom-scrollbar">
          {!showQuickRegister ? (
            /* --- GIAO DIỆN TÌM KIẾM --- */
            <div className="space-y-5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Nhập tên, số điện thoại hoặc email..." 
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 font-bold shadow-sm transition-all"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    autoFocus
                  />
                </div>
                <button 
                  onClick={() => setShowQuickRegister(true)}
                  className="bg-blue-50 text-blue-600 px-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 border border-blue-100"
                >
                  <UserPlus size={16} /> Tạo mới
                </button>
              </div>

              <div className="space-y-3">
                {isLoading && customers.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 animate-pulse font-bold uppercase tracking-widest text-[10px]">Đang truy xuất dữ liệu...</div>
                ) : customers.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                      <p className="text-slate-500 font-bold">Không tìm thấy khách hàng nào</p>
                      <button 
                        onClick={() => setShowQuickRegister(true)}
                        className="mt-2 text-emerald-500 font-black text-xs uppercase underline underline-offset-4"
                      >
                        Tạo tài khoản mới ngay
                      </button>
                    </div>
                ) : (
                    customers.map((c) => (
                      <div 
                        key={c.userId} 
                        onClick={() => handleSelectCustomer(c)}
                        className="flex items-center p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-50 cursor-pointer transition-all group animate-in slide-in-from-bottom-2"
                      >
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 mr-4 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          <UserIcon size={24} />
                        </div>
                        <div className="flex flex-col">
                            <p className="font-bold text-slate-800 text-[15px]">{c.fullName}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-bold">
                            <span className="flex items-center gap-1"><Phone size={12} className="text-emerald-500"/> {c.phone || "---"}</span>
                            <span className="text-slate-200">|</span>
                            <span className="flex items-center gap-1"><Mail size={12} className="text-blue-400"/> {c.email}</span>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          ) : (
            /* --- GIAO DIỆN ĐĂNG KÝ NHANH --- */
            <form onSubmit={handleQuickRegister} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-2">
                <p className="text-blue-700 text-xs font-bold leading-relaxed">
                  💡 Bạn đang tạo tài khoản cho khách mua tại quầy. Mật khẩu mặc định sẽ là 
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded ml-1 font-mono">123456</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Họ tên khách hàng *</label>
                  <input 
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold text-slate-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Số điện thoại *</label>
                  <input 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="09xx..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold text-slate-700"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email (Dùng để gửi hóa đơn)</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="customer@gmail.com"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowQuickRegister(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Xác nhận tạo & Chọn
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
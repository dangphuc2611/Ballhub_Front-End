"use client";

import { useState, useEffect } from "react";
import { X, MapPin } from "lucide-react";
import { toast } from "sonner";
import { usePosStore } from "@/lib/usePosStore";

interface PosAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number | null;
  onSelectSuccess?: () => void; // ✅ ĐÃ KHAI BÁO THÊM DÒNG NÀY
}

interface Address {
  addressId: number;
  fullName: string;
  phone: string;
  fullAddress: string;
  isDefault: boolean;
}

export const PosAddressModal = ({ isOpen, onClose, customerId, onSelectSuccess }: PosAddressModalProps) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { updateActiveOrderDetails } = usePosStore();

  useEffect(() => {
    if (!isOpen || !customerId) return;

    const fetchAddresses = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("refreshToken");
        const res = await fetch(`http://localhost:8080/api/addresses/admin/user/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) {
          setAddresses(result.data);
        }
      } catch (error) {
        toast.error("Lỗi khi tải địa chỉ!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [isOpen, customerId]);

  const handleSelectAddress = (addr: Address) => {
    updateActiveOrderDetails({
      addressId: addr.addressId,
      deliveryAddress: addr.fullAddress,
      shippingFee: 30000 
    });
    toast.success("Đã áp dụng địa chỉ giao hàng!");
    
    // ✅ GỌI HÀM NÀY ĐỂ BÁO CHO POSVIEW BIẾT LÀ ĐÃ CHỌN XONG
    if (onSelectSuccess) {
      onSelectSuccess();
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh] animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-800">Danh sách địa chỉ</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
          {isLoading ? (
            <div className="text-center py-10 text-slate-400 animate-pulse font-bold uppercase tracking-widest text-xs">Đang tải địa chỉ...</div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-medium flex flex-col items-center">
              <MapPin size={48} className="text-slate-200 mb-3" />
              Khách hàng này chưa có địa chỉ nào trong hệ thống!
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.addressId}
                  onClick={() => handleSelectAddress(addr)}
                  className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all relative group"
                >
                  {addr.isDefault && (
                    <span className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-md">MẶC ĐỊNH</span>
                  )}
                  <p className="font-bold text-slate-800 mb-1">{addr.fullName} <span className="text-slate-400 font-normal ml-2">{addr.phone}</span></p>
                  <p className="text-sm text-slate-600 flex items-start gap-1.5 leading-snug">
                    <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    {addr.fullAddress}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
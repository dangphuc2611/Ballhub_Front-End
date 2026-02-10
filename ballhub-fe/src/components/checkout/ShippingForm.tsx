'use client';

import { useEffect, useState } from 'react';
import { 
    MapPin, 
    CheckCircle2, 
    Loader2, 
    Plus, 
    X, 
    Send, 
    MessageSquare, 
    Trash2, 
    AlertTriangle 
} from 'lucide-react';
import api from '@/lib/cartApi';
import { toast } from 'sonner';

interface LocationItem {
    code: number;
    name: string;
}

export function ShippingForm({ formData, setFormData }: any) {
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, id: string | null}>({
        show: false,
        id: null
    });

    const [provinces, setProvinces] = useState<LocationItem[]>([]);
    const [districts, setDistricts] = useState<LocationItem[]>([]);
    const [wards, setWards] = useState<LocationItem[]>([]);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>("");
    const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>("");

    const [addressForm, setAddressForm] = useState({
        fullName: '',
        phone: '',
        email: '',
        city: '',
        district: '',
        ward: '',
        street: ''
    });

    const fetchAddresses = async () => {
        try {
            const response = await api.get("/users/me/addresses");
            const addrData = response.data.data;
            setAddresses(addrData);
            
            if (addrData.length > 0 && !formData.addressId) {
                const defaultAddr = addrData.find((a: any) => a.isDefault) || addrData[0];
                setFormData((prev: any) => ({ ...prev, addressId: defaultAddr.addressId }));
            }
        } catch (error) {
            console.error("Lỗi lấy địa chỉ:", error);
        }
    };

    useEffect(() => {
        const initData = async () => {
            try {
                const [userRes, provinceRes] = await Promise.all([
                    api.get("/users/me"),
                    fetch("https://provinces.open-api.vn/api/p/").then(res => res.json())
                ]);

                const userData = userRes.data.data;
                if (userData) {
                    const profile = {
                        fullName: userData.fullName || '',
                        phone: userData.phone || '',
                        email: userData.email || ''
                    };
                    setAddressForm(prev => ({ ...prev, ...profile }));
                    setFormData((prev: any) => ({ ...prev, ...profile }));
                }
                setProvinces(provinceRes);
                await fetchAddresses();
            } catch (error) {
                toast.error("Không thể khởi tạo dữ liệu");
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, []);

    useEffect(() => {
        if (!selectedProvinceCode) {
            setDistricts([]);
            return;
        }
        fetch(`https://provinces.open-api.vn/api/p/${selectedProvinceCode}?depth=2`)
            .then(res => res.json())
            .then(data => setDistricts(data.districts || []));
    }, [selectedProvinceCode]);

    useEffect(() => {
        if (!selectedDistrictCode) {
            setWards([]);
            return;
        }
        fetch(`https://provinces.open-api.vn/api/d/${selectedDistrictCode}?depth=2`)
            .then(res => res.json())
            .then(data => setWards(data.wards || []));
    }, [selectedDistrictCode]);

    const handleAddNewAddress = async () => {
        const { city, district, ward, street } = addressForm;
        if (!city || !district || !ward || !street) {
            return toast.error("Vui lòng điền đầy đủ địa chỉ");
        }

        setIsSubmitting(true);
        try {
            const fullString = `${street}, ${ward}, ${district}, ${city}`;
            const response = await api.post("/users/me/addresses", {
                fullAddress: fullString,
                isDefault: addresses.length === 0 
            });

            if (response.data.success) {
                toast.success("Thêm địa chỉ mới thành công");
                setIsAdding(false);
                await fetchAddresses();
                setFormData((prev: any) => ({ ...prev, addressId: response.data.data.addressId }));
                setAddressForm(prev => ({ ...prev, city: '', district: '', ward: '', street: '' }));
                setSelectedProvinceCode("");
                setSelectedDistrictCode("");
            }
        } catch (error) {
            toast.error("Lỗi khi lưu địa chỉ");
        } finally {
            setIsSubmitting(false);
        }
    };

    const executeDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            const response = await api.delete(`/users/me/addresses/${deleteConfirm.id}`);
            if (response.data.success) {
                toast.success("Đã xóa địa chỉ");
                if (formData.addressId === deleteConfirm.id) {
                    setFormData((prev: any) => ({ ...prev, addressId: '' }));
                }
                await fetchAddresses();
            }
        } catch (error) {
            toast.error("Lỗi khi xóa địa chỉ");
        } finally {
            setDeleteConfirm({ show: false, id: null });
        }
    };

    if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-green-600" size={40} /></div>;

    return (
        <>
            {/* MODAL XÁC NHẬN XÓA (Hiện giữa màn hình) */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setDeleteConfirm({show: false, id: null})}
                    />
                    
                    {/* Modal Content */}
                    <div className="relative bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận xóa?</h3>
                        <p className="text-slate-500 text-sm mb-8">Địa chỉ này sẽ bị xóa vĩnh viễn khỏi danh sách của bạn.</p>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setDeleteConfirm({show: false, id: null})}
                                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={executeDelete}
                                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                            >
                                Xóa ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">1</div>
                        <h2 className="text-xl font-bold">Thông tin người nhận</h2>
                    </div>
                    <button 
                        type="button"
                        onClick={() => setIsAdding(!isAdding)}
                        className={`text-sm font-bold flex items-center gap-1 transition-colors ${isAdding ? 'text-red-500' : 'text-green-600'}`}
                    >
                        {isAdding ? <><X size={16} /> Hủy thêm</> : <><Plus size={16} /> Thêm địa chỉ mới</>}
                    </button>
                </div>

                {/* Các phần còn lại giữ nguyên như layout của bạn */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Họ và tên *</label>
                        <input 
                            type="text" 
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            value={formData.fullName || ''} 
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Số điện thoại *</label>
                        <input 
                            type="text" 
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            value={formData.phone || ''} 
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                </div>

                {isAdding && (
                    <div className="p-6 bg-green-50/50 rounded-2xl border border-green-100 animate-in slide-in-from-top-4 duration-300 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select 
                                className="bg-white border border-gray-200 p-3 rounded-xl text-sm outline-none"
                                value={selectedProvinceCode}
                                onChange={(e) => {
                                    const code = e.target.value;
                                    const name = provinces.find(p => p.code.toString() === code)?.name || "";
                                    setSelectedProvinceCode(code);
                                    setSelectedDistrictCode("");
                                    setAddressForm({...addressForm, city: name, district: '', ward: ''});
                                }}
                            >
                                <option value="">Chọn Tỉnh/Thành</option>
                                {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                            </select>

                            <select 
                                className="bg-white border border-gray-200 p-3 rounded-xl text-sm outline-none disabled:opacity-50"
                                disabled={!selectedProvinceCode}
                                value={selectedDistrictCode}
                                onChange={(e) => {
                                    const code = e.target.value;
                                    const name = districts.find(d => d.code.toString() === code)?.name || "";
                                    setSelectedDistrictCode(code);
                                    setAddressForm({...addressForm, district: name, ward: ''});
                                }}
                            >
                                <option value="">Chọn Quận/Huyện</option>
                                {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                            </select>

                            <select 
                                className="bg-white border border-gray-200 p-3 rounded-xl text-sm outline-none disabled:opacity-50"
                                disabled={!selectedDistrictCode}
                                onChange={(e) => {
                                    const name = wards.find(w => w.code.toString() === e.target.value)?.name || "";
                                    setAddressForm({...addressForm, ward: name});
                                }}
                            >
                                <option value="">Chọn Phường/Xã</option>
                                {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                            </select>
                        </div>

                        <textarea 
                            placeholder="Số nhà, tên đường..." 
                            className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm min-h-[80px] outline-none"
                            value={addressForm.street} 
                            onChange={e => setAddressForm({...addressForm, street: e.target.value})} 
                        />

                        <button 
                            type="button" 
                            onClick={handleAddNewAddress} 
                            className="w-full bg-green-600 text-white h-12 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-green-700 transition-all"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                            Lưu địa chỉ
                        </button>
                    </div>
                )}

                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Địa chỉ giao hàng *</label>
                    <div className="grid grid-cols-1 gap-3">
                        {addresses.map((addr) => (
                            <div 
                                key={addr.addressId} 
                                onClick={() => setFormData({ ...formData, addressId: addr.addressId })}
                                className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                                    formData.addressId === addr.addressId ? 'border-green-500 bg-green-50/30' : 'border-gray-50 hover:border-gray-200'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${formData.addressId === addr.addressId ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <MapPin size={20} />
                                </div>
                                <div className="flex-1 pr-10">
                                    <p className="text-sm font-medium text-gray-700 leading-snug">{addr.fullAddress}</p>
                                    {addr.isDefault && <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded uppercase font-bold mt-1 inline-block">Mặc định</span>}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {formData.addressId === addr.addressId && <CheckCircle2 className="text-green-600" size={20} />}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteConfirm({ show: true, id: addr.addressId });
                                        }}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all md:opacity-0 md:group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-50">
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                        <MessageSquare size={14} /> Ghi chú cho đơn hàng
                    </label>
                    <textarea 
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                        placeholder="Ví dụ: Giao sau 5h chiều..."
                        value={formData.note || ''}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    />
                </div>
            </section>
        </>
    );
}
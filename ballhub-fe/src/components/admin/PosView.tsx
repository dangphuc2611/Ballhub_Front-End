"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, ShoppingCart, CreditCard, Printer, User, Trash2, Minus, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Product {
  productId: number;
  productName: string;
  categoryName: string;
  brandName: string;
  mainImage: string;
  minPrice: number;
}

interface CartItem extends Product {
  quantity: number;
}

export const PosView = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("refreshToken");
        const res = await fetch(`http://localhost:8080/api/products?page=0&size=50`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (result.success) setProducts(result.data.content);
      } catch (error) {
        toast.error("Không thể tải danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brandName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.productId);
      if (existingItem) {
        return prevCart.map(item => 
          item.productId === product.productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.productId === id) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => setCart(prevCart => prevCart.filter(item => item.productId !== id));

  const totalAmount = cart.reduce((sum, item) => sum + (item.minPrice * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

  // ==========================================
  // LOGIC IN HÓA ĐƠN & THANH TOÁN HOÀN CHỈNH
  // ==========================================

  const handlePrint = () => {
    if (cart.length === 0) {
      toast.warning("Giỏ hàng trống!");
      return;
    }
    window.print();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const token = localStorage.getItem("refreshToken");

      // ==============================================================
      // BƯỚC 1: ĐẨY SẢN PHẨM VÀO GIỎ HÀNG CỦA ADMIN
      // ==============================================================
      for (const item of cart) {
        const addCartRes = await fetch(`http://localhost:8080/api/cart/items`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ 
            // ✅ ĐÃ SỬA: Đổi từ productId thành variantId cho đúng DTO của Backend
            variantId: item.productId, 
            quantity: item.quantity 
          })
        });

        if (!addCartRes.ok) {
           const errText = await addCartRes.text();
           console.error("Lỗi thêm giỏ hàng:", errText);
           throw new Error("Không thể thêm sản phẩm vào giỏ hàng hệ thống!");
        }
      }

      // ==============================================================
      // BƯỚC 2: GỌI API TẠO ĐƠN HÀNG (Chuẩn URL /api/orders)
      // ==============================================================
      const orderPayload = {
        addressId: null, // Bán tại quầy không cần địa chỉ giao hàng
        paymentMethodId: 1, // Tiền mặt
        note: "Khách mua trực tiếp tại quầy",
        promoCode: null,
        shippingFee: 0,
        isPos: true // Cờ báo cho Backend đây là đơn POS
      };

      const orderRes = await fetch(`http://localhost:8080/api/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(orderPayload)
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        console.error("Lỗi tạo đơn:", errorData);
        throw new Error(errorData.message || "Lỗi khi chốt hóa đơn!");
      }

      // ==============================================================
      // BƯỚC 3: THÀNH CÔNG -> IN HÓA ĐƠN & RESET
      // ==============================================================
      window.print(); // Bật cửa sổ in hóa đơn máy in nhiệt
      toast.success("Thanh toán thành công!", { icon: <CheckCircle2 className="text-emerald-500" /> });
      setCart([]); // Xóa trắng giỏ hàng
      
      // Load lại dữ liệu thống kê bên Admin (nếu có dùng event)
      window.dispatchEvent(new Event("cartUpdated"));
      
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi thanh toán!");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #pos-receipt, #pos-receipt * { visibility: visible; }
          #pos-receipt { 
            position: absolute; 
            left: 0; top: 0; 
            width: 80mm; 
            margin: 0; padding: 10px;
          }
        }
      `}</style>

      {/* GIAO DIỆN HÓA ĐƠN MÁY IN NHIỆT */}
      <div id="pos-receipt" className="hidden print:block text-black font-mono text-sm">
        <div className="text-center mb-4">
          <h2 className="font-bold text-xl uppercase">BALLHUB SPORT</h2>
          <p className="text-xs">Số 1 Đường ABC, TP HCM</p>
          <p className="text-xs">SĐT: 1900-533-456</p>
          <div className="border-b border-dashed border-black my-2"></div>
          <p className="font-bold">HÓA ĐƠN BÁN LẺ</p>
          <p className="text-xs">Ngày: {new Date().toLocaleString('vi-VN')}</p>
          <p className="text-xs">Khách hàng: Khách lẻ</p>
          <div className="border-b border-dashed border-black my-2"></div>
        </div>

        <table className="w-full text-xs text-left mb-2">
          <thead>
            <tr className="border-b border-black">
              <th className="pb-1">Tên món</th>
              <th className="pb-1 text-center">SL</th>
              <th className="pb-1 text-right">T.Tiền</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, idx) => (
              <tr key={idx} className="border-b border-dotted border-gray-400">
                <td className="py-2 pr-1 truncate max-w-[120px]">{item.productName}</td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right">{(item.minPrice * item.quantity).toLocaleString()}đ</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-b border-dashed border-black my-2"></div>
        <div className="flex justify-between font-bold text-sm">
          <span>TỔNG CỘNG:</span>
          <span>{formatPrice(totalAmount)}</span>
        </div>
        <div className="border-b border-dashed border-black my-2"></div>
        
        <div className="text-center mt-4 text-xs italic">
          <p>Cảm ơn quý khách và hẹn gặp lại!</p>
          <p>Powered by BallHub POS</p>
        </div>
      </div>


      {/* GIAO DIỆN POS CHÍNH */}
      <div className="flex gap-4 h-[calc(100vh-120px)] print:hidden">
        
        {/* CỘT TRÁI */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-white">
            <div className="flex items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 focus-within:border-emerald-300 transition-colors">
              <Search className="text-slate-400 mr-2" size={20} />
              <input 
                type="text" placeholder="Tìm tên sản phẩm hoặc hãng..." 
                className="bg-transparent border-none outline-none flex-1 text-slate-700 font-medium"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50">
            {loading ? (
              <div className="flex justify-center items-center h-full text-slate-400">Đang tải sản phẩm...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ShoppingCart size={48} className="mb-4 opacity-30" />
                <p>Không tìm thấy sản phẩm nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredProducts.map(p => (
                  <div key={p.productId} onClick={() => addToCart(p)} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all group flex flex-col">
                    <div className="relative w-full aspect-square bg-slate-50 rounded-lg mb-3 overflow-hidden">
                      <Image src={`http://localhost:8080${p.mainImage}`} alt={p.productName} fill className="object-contain group-hover:scale-105 transition-transform" unoptimized />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <p className="font-bold text-slate-700 text-sm line-clamp-2 leading-tight">{p.productName}</p>
                      <div className="mt-auto pt-2 flex items-end justify-between">
                        <p className="text-[10px] text-slate-400 font-medium uppercase">{p.brandName}</p>
                        <p className="font-bold text-emerald-600 text-sm">{formatPrice(p.minPrice)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="w-[420px] bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-emerald-100 transition">
              <User size={16} />
              <span className="text-sm">Khách lẻ</span>
            </div>
            <div className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">
              {totalItems} món
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center text-slate-400 text-sm mt-20 flex flex-col items-center">
                <ShoppingCart size={40} className="mb-3 opacity-20" />
                Chưa có sản phẩm nào
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.productId} className="flex gap-3 bg-white border border-slate-100 p-3 rounded-xl hover:shadow-sm transition-shadow group">
                    <div className="relative w-16 h-16 bg-slate-50 rounded-lg flex-shrink-0 border border-slate-100">
                      <Image src={`http://localhost:8080${item.mainImage}`} alt={item.productName} fill className="object-contain" unoptimized />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-bold text-sm text-slate-700 leading-tight line-clamp-2">{item.productName}</p>
                        <button onClick={() => removeFromCart(item.productId)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="font-bold text-emerald-600 text-sm">{formatPrice(item.minPrice)}</p>
                        <div className="flex items-center bg-slate-50 rounded-lg border border-slate-100">
                          <button onClick={() => updateQuantity(item.productId, -1)} className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 rounded-l-lg transition-colors text-slate-600">
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, 1)} className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 rounded-r-lg transition-colors text-slate-600">
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-sm">Cần thanh toán:</span>
                <span className="font-black text-2xl text-emerald-600 tracking-tight">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handlePrint}
                disabled={cart.length === 0}
                className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
              >
                <Printer size={18} /> In tạm
              </button>
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0 || isProcessing}
                className="flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? <span className="animate-spin text-xl">↻</span> : <CreditCard size={18} />} 
                {isProcessing ? "Đang xử lý..." : "Thanh toán"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, Minus, Plus } from "lucide-react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";

type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  size: string;
  image: string;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const router = useRouter();

  // ✅ Check login
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
      return;
    }

    // ✅ load cart từ localStorage (nếu có)
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [router]);

  // ✅ sync cart -> localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
      )
    );
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const goHome = () => {
    router.push("/");
  };

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold mb-6">
            Giỏ hàng của bạn{" "}
            <span className="text-green-600 text-sm font-medium">
              ({cart.length} sản phẩm)
            </span>
          </h1>

          <div className="bg-white rounded-xl border">
            {/* Header */}
            <div className="grid grid-cols-12 px-6 py-3 text-sm text-gray-500 border-b">
              <div className="col-span-5">Sản phẩm</div>
              <div className="col-span-2 text-center">Đơn giá</div>
              <div className="col-span-3 text-center">Số lượng</div>
              <div className="col-span-2 text-right">Thành tiền</div>
            </div>

            {/* Items */}
            {cart.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                🛒 Giỏ hàng của bạn đang trống
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 px-6 py-4 items-center border-b last:border-none"
                >
                  {/* product */}
                  <div className="col-span-5 flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg relative overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <div className="flex gap-2 mt-1 text-xs">
                        <span className="px-2 py-0.5 bg-gray-100 rounded">
                          Size {item.size}
                        </span>
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded">
                          Chính hãng
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* price */}
                  <div className="col-span-2 text-center text-sm">
                    {item.price.toLocaleString("vi-VN")}đ
                  </div>

                  {/* qty */}
                  <div className="col-span-3 flex justify-center">
                    <div className="flex items-center border rounded-lg overflow-hidden">
                      <button
                        className="px-3 py-1 hover:bg-gray-100"
                        onClick={() => updateQty(item.id, -1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-4 text-sm">{item.qty}</span>
                      <button
                        className="px-3 py-1 hover:bg-gray-100"
                        onClick={() => updateQty(item.id, 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* total */}
                  <div className="col-span-2 text-right font-semibold text-sm">
                    {(item.price * item.qty).toLocaleString("vi-VN")}đ
                  </div>

                  {/* delete */}
                  <div className="col-span-12 text-right mt-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT SUMMARY */}
        <div className="bg-white rounded-xl border p-6 h-fit">
          <h2 className="font-semibold mb-4">Tổng kết đơn hàng</h2>

          <div className="flex justify-between text-sm mb-2">
            <span>Tạm tính</span>
            <span>{subtotal.toLocaleString("vi-VN")}đ</span>
          </div>

          <div className="flex justify-between text-sm mb-4">
            <span>Phí vận chuyển</span>
            <span className="text-gray-500">Tính khi thanh toán</span>
          </div>

          {/* coupon */}
          <div className="mb-4">
            <p className="text-xs mb-1 text-gray-500">Mã khuyến mãi</p>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none"
                placeholder="Nhập mã giảm giá"
              />
              <Button variant="outline">Áp dụng</Button>
            </div>
          </div>

          <div className="flex justify-between font-bold text-lg mb-4">
            <span>Tổng thanh toán</span>
            <span className="text-green-600">
              {subtotal.toLocaleString("vi-VN")}đ
            </span>
          </div>

          <Button className="w-full bg-green-500 hover:bg-green-600 text-white mb-3">
            THANH TOÁN
          </Button>

          <p
            onClick={goHome}
            className="text-center text-sm text-green-600 cursor-pointer hover:underline"
          >
            ← Tiếp tục mua sắm
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6 text-xs text-center text-gray-600">
            <div className="border rounded-lg p-2">🔒 Bảo mật 100%</div>
            <div className="border rounded-lg p-2">🔁 Đổi trả 30 ngày</div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

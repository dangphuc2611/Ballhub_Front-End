"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShoppingCart,
  Truck,
  ShieldCheck,
  Loader2,
  ChevronRight,
  Barcode // ✅ Import thêm icon Barcode cho mã SKU
} from "lucide-react";
import { toast } from "sonner";

import Breadcrumb from "@/components/ui/BaseBreadcrumb";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { ProductReviewsSection } from "@/components/sections/ProductReviewsSection";
import { ProductDetail } from "@/types/product";
import { addToCartApi } from "@/lib/cartApi";
import { API_URL, API_BASE_URL, getImageUrl } from "@/config/env";

type TabKey = "description" | "specs" | "policy";



// ✅ LUÔN HIỆN ĐỦ SIZE
const ALL_SIZES = ["S", "M", "L", "XL", "XXL"] as const;

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const productId = Array.isArray(rawId) ? rawId[0] : rawId;

  /* ================= STATE ================= */
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number | string>(1);

  const [activeTab, setActiveTab] = useState<TabKey>("description");
  const [activeImage, setActiveImage] = useState<string | null>(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!productId || productId === "undefined") return;

    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products/${productId}`);
        const json = await res.json();

        const p = {
          ...json.data,
          contentBlock: json.data.contentBlock ?? {
            description: null,
            highlights: [],
            specs: [],
          },
        };

        setProduct(p);

        const mainImg = p.images?.find((img: any) => img.isMain)?.imageUrl || p.images?.[0]?.imageUrl;
        setActiveImage(getImageUrl(mainImg));
      } catch (e) {
        console.error("❌ Load product failed", e);
        toast.error("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  /* ================= LOGIC GIỎ HÀNG ================= */
  const checkAuth = () => {
    const token = localStorage.getItem("refreshToken");
    if (!token) {
      toast.error("Vui lòng đăng nhập để mua sắm");
      router.push("/login");
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!matchedVariant) return toast.error("Vui lòng chọn đầy đủ thuộc tính!");
    if (!checkAuth()) return;

    const finalQuantity = Number(quantity) || 1;

    setIsSubmitting(true);
    try {
      await addToCartApi(matchedVariant.variantId, finalQuantity);
      window.dispatchEvent(new Event("cartUpdated"));

      toast.success(
        <div className="flex flex-col gap-1">
          <p className="font-medium text-gray-900">
            Đã thêm{" "}
            <span className="text-blue-600 font-bold">x{finalQuantity}</span>{" "}
            {product?.productName} vào giỏ hàng!
          </p>
          <button
            onClick={() => router.push("/shoppingcart")}
            className="text-blue-600 text-xs font-bold flex items-center hover:underline mt-1"
          >
            XEM GIỎ HÀNG <ChevronRight size={12} />
          </button>
        </div>
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi thêm vào giỏ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyNow = async () => {
    if (!matchedVariant) return toast.error("Vui lòng chọn đầy đủ thuộc tính!");
    if (!checkAuth()) return;

    const finalQuantity = Number(quantity) || 1;

    setIsSubmitting(true);
    try {
      await addToCartApi(matchedVariant.variantId, finalQuantity);
      window.dispatchEvent(new Event("cartUpdated"));
      router.push("/shoppingcart");
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
      setIsSubmitting(false);
    }
  };

  /* ================= XỬ LÝ NHẬP SỐ LƯỢNG ================= */
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setQuantity("");
      return;
    }
    const num = parseInt(val.replace(/\D/g, ""), 10);
    if (isNaN(num)) return;

    if (matchedVariant && num > matchedVariant.stockQuantity) {
      setQuantity(matchedVariant.stockQuantity);
      toast.warning(`Kho chỉ còn ${matchedVariant.stockQuantity} sản phẩm`);
    } else {
      setQuantity(num);
    }
  };

  const handleQuantityBlur = () => {
    if (quantity === "" || Number(quantity) < 1) {
      setQuantity(1);
    }
  };

  /* ================= COMPUTED ================= */
  const matchedVariant = useMemo(() => {
    if (!product || !selectedSizeId || !selectedColorId) return null;
    return (
      product.variants.find(
        (v) => v.sizeId === selectedSizeId && v.colorId === selectedColorId
      ) ?? null
    );
  }, [product, selectedSizeId, selectedColorId]);

  const stockBySizeId = useMemo(() => {
    const map = new Map<number, number>();
    if (!product) return map;
    product.variants.forEach((v) => {
      map.set(v.sizeId, (map.get(v.sizeId) ?? 0) + (v.stockQuantity ?? 0));
    });
    return map;
  }, [product]);

  const stockByColorIdForSelectedSize = useMemo(() => {
    const map = new Map<number, number>();
    if (!product || !selectedSizeId) return map;
    product.variants.forEach((v) => {
      if (v.sizeId === selectedSizeId) {
        map.set(v.colorId, (map.get(v.colorId) ?? 0) + (v.stockQuantity ?? 0));
      }
    });
    return map;
  }, [product, selectedSizeId]);

  /* ================= RENDER ================= */
  if (loading || !productId)
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-gray-500 font-medium">Đang tải sản phẩm...</p>
        </div>
        <Footer />
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center text-red-500 font-medium">
          Sản phẩm không tồn tại
        </div>
        <Footer />
      </div>
    );

  return (
    <main className="bg-[#F6F7FB] min-h-screen">
      <Header />

      <div className="max-w-6xl mx-auto px-4 pt-6">
        <Breadcrumb
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Danh sách sản phẩm", href: "/products" },
            ...(product.categoryName
              ? [
                  {
                    label: product.categoryName,
                    href: `/products?categories=${encodeURIComponent(
                      product.categoryName
                    )}`,
                  },
                ]
              : []),
            { label: product.productName },
          ]}
        />
      </div>

      <section className="max-w-6xl mx-auto px-4 pt-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* TRÁI: IMAGE */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
                <Image
                  src={activeImage ?? "/no-image.png"}
                  alt={product.productName}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              {product.images.map((img, idx) => {
                const src = getImageUrl(img.imageUrl);
                const isActive = activeImage === src;

                return (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(src)}
                    className={`relative w-[84px] h-[84px] rounded-xl overflow-hidden border bg-white transition 
                      ${
                        isActive
                          ? "border-blue-600"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                  >
                    <Image
                      src={src}
                      alt="thumb"
                      fill
                      unoptimized
                      className="object-contain p-2"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* PHẢI: INFO */}
          <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                    {product.brandName}
                  </p>
                  
                  {/* 🚀 BỔ SUNG PHẦN HIỂN THỊ SKU TẠI ĐÂY */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                    <Barcode size={14} className="text-gray-500" />
                    <span>SKU: {matchedVariant?.sku || "Đang cập nhật..."}</span>
                  </div>
                </div>

                {product.categoryName && (
                  <p className="text-xs text-gray-400 font-semibold mt-1 uppercase tracking-widest">
                    {product.categoryName}
                  </p>
                )}

                <h1 className="text-3xl font-bold text-gray-900 leading-tight mt-2">
                  {product.productName}
                </h1>
              </div>

              {/* ================= KHU VỰC GIÁ ================= */}
              <div className="flex items-end gap-3 mb-2">
                <div className={`text-3xl font-extrabold ${(product.discountPercent || 0) > 0 ? "text-red-600" : "text-blue-600"}`}>
                  {matchedVariant 
                    ? (matchedVariant?.discountPrice || ((matchedVariant?.price || 0) * (100 - (product.discountPercent || 0)) / 100)).toLocaleString() 
                    : product.minPrice?.toLocaleString()}đ
                </div>

                {(product.discountPercent || 0) > 0 ? (
                  <>
                    <div className="text-base text-gray-400 line-through pb-1 font-medium">
                      {matchedVariant 
                        ? (matchedVariant?.price || 0).toLocaleString() 
                        : product.minOriginalPrice?.toLocaleString()}đ
                    </div>
                    <div className="mb-1.5 bg-red-100 text-red-600 text-sm font-black px-2 py-0.5 rounded border border-red-200">
                      GIẢM {product.discountPercent}%
                    </div>
                  </>
                ) : (
                  !matchedVariant && product.minPrice !== product.maxPrice && (
                    <div className="text-base text-gray-400 pb-1">
                      - {product.maxPrice?.toLocaleString()}đ
                    </div>
                  )
                )}
              </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
              {/* SIZE */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Chọn Size</h3>
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map((sizeName) => {
                    const dbSize = product.sizeOptions.find(
                      (s) => s.sizeName?.toUpperCase() === sizeName
                    );

                    const sizeId = dbSize?.sizeId ?? null;
                    const isSelected = selectedSizeId === sizeId;

                    const totalStock = sizeId
                      ? stockBySizeId.get(sizeId) ?? 0
                      : 0;

                    const isAvailable = !!dbSize && totalStock > 0;

                    return (
                      <button
                        key={sizeName}
                        disabled={!isAvailable}
                        onClick={() => {
                          setSelectedSizeId(sizeId);
                          setSelectedColorId(null);
                          setQuantity(1);
                        }}
                        className={`h-10 min-w-[52px] px-4 rounded-xl border text-sm font-semibold transition 
                          ${
                            isSelected && isAvailable
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-900 border-gray-200 hover:border-blue-400"
                          }
                          ${
                            !isAvailable
                              ? "opacity-40 cursor-not-allowed bg-gray-50"
                              : ""
                          }`}
                      >
                        {sizeName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* COLOR */}
              {selectedSizeId && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Chọn màu sắc
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {product.colorOptions.map((color) => {
                      const isSelected = selectedColorId === color.colorId;
                      const isAvailable =
                        (stockByColorIdForSelectedSize.get(color.colorId) ??
                          0) > 0;

                      return (
                        <button
                          key={color.colorId}
                          disabled={!isAvailable}
                          onClick={() => {
                            setSelectedColorId(color.colorId);
                            setQuantity(1);
                          }}
                          className={`relative h-10 px-4 rounded-xl border text-sm font-semibold transition
                            ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-800 border-gray-200 hover:border-blue-400"
                            }
                            ${
                              !isAvailable
                                ? "opacity-40 cursor-not-allowed"
                                : ""
                            }`}
                        >
                          {color.colorName}
                          {!isAvailable && (
                            <span className="absolute -top-2 -right-2 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-gray-800 text-white">
                              HẾT
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QUANTITY */}
              {matchedVariant && (
                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">Số lượng</span>

                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, (Number(q) || 1) - 1))}
                        className="w-10 h-10 hover:bg-gray-50 font-bold flex items-center justify-center text-gray-600 transition"
                      >
                        −
                      </button>
                      
                      <input
                        type="text"
                        value={quantity}
                        onChange={handleQuantityChange}
                        onBlur={handleQuantityBlur}
                        className="w-12 h-10 text-center font-bold text-gray-900 outline-none border-x border-gray-200"
                        maxLength={3}
                      />

                      <button
                        onClick={() =>
                          setQuantity((q) =>
                            Math.min(matchedVariant.stockQuantity, (Number(q) || 0) + 1)
                          )
                        }
                        className="w-10 h-10 hover:bg-gray-50 font-bold flex items-center justify-center text-gray-600 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Còn{" "}
                    <span className="font-bold text-gray-900">
                      {matchedVariant.stockQuantity}
                    </span>{" "}
                    sp
                  </div>
                </div>
              )}

              {/* ACTIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <button
                  disabled={!matchedVariant || isSubmitting}
                  onClick={handleAddToCart}
                  className={`h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition 
                    ${
                      matchedVariant
                        ? "border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <ShoppingCart size={18} /> Thêm vào giỏ
                    </>
                  )}
                </button>

                <button
                  disabled={!matchedVariant || isSubmitting}
                  onClick={handleBuyNow}
                  className={`h-12 rounded-xl font-bold text-white transition shadow-lg
                    ${
                      matchedVariant
                        ? "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                >
                  Mua ngay
                </button>
              </div>

              {/* BENEFITS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <BenefitCard
                  icon={<Truck size={18} />}
                  title="Giao hàng nhanh"
                  desc="Toàn quốc 2-4 ngày"
                />
                <BenefitCard
                  icon={<ShieldCheck size={18} />}
                  title="Chính hãng"
                  desc="Cam kết 100% Authentic"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TABS CONTENT */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex gap-8 border-b border-gray-200">
          <TabButton
            active={activeTab === "description"}
            onClick={() => setActiveTab("description")}
          >
            Mô tả chi tiết
          </TabButton>
          <TabButton
            active={activeTab === "specs"}
            onClick={() => setActiveTab("specs")}
          >
            Thông số kỹ thuật
          </TabButton>
          <TabButton
            active={activeTab === "policy"}
            onClick={() => setActiveTab("policy")}
          >
            Chính sách đổi trả
          </TabButton>
        </div>

        <div className="pt-8">
          {activeTab === "description" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-tight">
                  Mô tả sản phẩm
                </h2>

                {product.contentBlock.description ? (
                  <article
                    className="prose max-w-none prose-blue prose-img:rounded-xl"
                    dangerouslySetInnerHTML={{
                      __html: product.contentBlock.description.html,
                    }}
                  />
                ) : (
                  <p className="text-gray-500 italic">Đang cập nhật nội dung...</p>
                )}
              </div>

              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Thông số nhanh
                  </h3>

                  <div className="space-y-3">
                    {product.contentBlock.specs.slice(0, 5).map((s, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-sm border-b border-gray-50 pb-2"
                      >
                        <span className="text-gray-500">{s.label}</span>
                        <span className="font-semibold text-gray-900">
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-3xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-tight">
                Chi tiết thông số
              </h2>

              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {product.contentBlock.specs.map((spec, i) => (
                      <tr
                        key={i}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >
                        <td className="p-4 bg-gray-50/50 w-1/3 font-semibold text-gray-600">
                          {spec.label}
                        </td>
                        <td className="p-4 text-gray-900 font-medium">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "policy" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase">
                Chính sách của chúng tôi
              </h2>

              <div className="space-y-4 text-gray-600 leading-relaxed">
                <div className="flex gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  <p>
                    Đổi trả miễn phí trong <b>7 ngày</b> đầu tiên nếu lỗi do nhà
                    sản xuất.
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  <p>Sản phẩm phải còn nguyên tem, mác và chưa qua sử dụng.</p>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  <p>
                    Bảo hành chính hãng <b>12 tháng</b> theo tiêu chuẩn của brand.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <ProductReviewsSection productId={Number(productId)} />
      </section>

      <Footer />
    </main>
  );
}

/* ================= COMPONENT CON ================= */

function BenefitCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 bg-gray-50/30">
      <div className="text-blue-600 bg-white p-2 rounded-lg shadow-sm">
        {icon}
      </div>
      <div>
        <div className="text-xs font-bold text-gray-900 uppercase tracking-tighter">
          {title}
        </div>
        <div className="text-[10px] text-gray-500 font-medium">{desc}</div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative py-4 text-sm font-bold uppercase tracking-wider transition-all ${
        active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
      }`}
    >
      {children}
      {active && (
        <span className="absolute left-0 bottom-0 h-0.5 w-full bg-blue-600 rounded-full" />
      )}
    </button>
  );
}
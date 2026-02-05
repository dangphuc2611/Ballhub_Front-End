'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, Truck, ShieldCheck } from 'lucide-react';

import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { ProductDetail } from '@/types/product';
import { ProductReviewsSection } from '@/components/sections/ProductReviewsSection';

type TabKey = 'description' | 'specs' | 'policy';

/* ================= CONST OPTIONS ================= */

// ✅ luôn hiển thị full size như shop thật
const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;
type SizeName = (typeof ALL_SIZES)[number];

export default function ProductDetailPage() {
  /* ================= PARAMS ================= */

  // ✅ FIX: id có thể undefined hoặc string[]
  const params = useParams();
  const rawId = params?.id;
  const productId = Array.isArray(rawId) ? rawId[0] : rawId;

  /* ================= STATE ================= */

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [activeTab, setActiveTab] = useState<TabKey>('description');
  const [activeImage, setActiveImage] = useState<string | null>(null);

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!productId || productId === 'undefined') return;

    async function fetchProduct() {
      setLoading(true);

      try {
        const res = await fetch(
          `http://localhost:8080/api/products/${productId}`
        );
        const json = await res.json();

        const p = {
          ...json.data,
          contentBlock: json.data.contentBlock ?? {
            description: null,
            highlights: [],
            specs: []
          }
        };

        setProduct(p);

        const main =
          p.images.find((i: any) => i.isMain)?.imageUrl ||
          p.images[0]?.imageUrl ||
          null;

        setActiveImage(main ? `http://localhost:8080${main}` : null);
      } catch (e) {
        console.error('❌ Load product failed', e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  /* ================= COMPUTED ================= */

  // match variant theo size + color
  const matchedVariant = useMemo(() => {
    if (!product || !selectedSizeId || !selectedColorId) return null;

    return (
      product.variants.find(
        v => v.sizeId === selectedSizeId && v.colorId === selectedColorId
      ) ?? null
    );
  }, [product, selectedSizeId, selectedColorId]);

  // tổng stock theo size (để biết size có hàng không)
  const stockBySizeId = useMemo(() => {
    const map = new Map<number, number>();
    if (!product) return map;

    for (const v of product.variants) {
      const current = map.get(v.sizeId) ?? 0;
      map.set(v.sizeId, current + (v.stockQuantity ?? 0));
    }

    return map;
  }, [product]);

  // tổng stock theo color (khi đã chọn size)
  const stockByColorIdForSelectedSize = useMemo(() => {
    const map = new Map<number, number>();
    if (!product || !selectedSizeId) return map;

    for (const v of product.variants) {
      if (v.sizeId !== selectedSizeId) continue;

      const current = map.get(v.colorId) ?? 0;
      map.set(v.colorId, current + (v.stockQuantity ?? 0));
    }

    return map;
  }, [product, selectedSizeId]);

  /* ================= LOADING / EMPTY ================= */

  if (!productId) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
          Đang tải...
        </div>
        <Footer />
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
          Đang tải sản phẩm...
        </div>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
          Không tìm thấy sản phẩm
        </div>
        <Footer />
      </main>
    );
  }

  /* ================= IMAGES ================= */

  const images = product.images?.length ? product.images : [];
  const mainImageSrc = activeImage ?? '/no-image.png';

  /* ================= UI ================= */

  return (
    <main className="bg-[#F6F7FB] min-h-screen">
      <Header />

      {/* ================= TOP ================= */}
      <section className="max-w-6xl mx-auto px-4 pt-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ================= LEFT: IMAGE + THUMB ================= */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
                <Image
                  src={mainImageSrc}
                  alt={product.productName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized
                  className="object-contain"
                />
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 flex-wrap">
                {images.slice(0, 6).map((img, idx) => {
                  const src = img.imageUrl
                    ? `http://localhost:8080${img.imageUrl}`
                    : '/no-image.png';

                  const isActive = src === mainImageSrc;

                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(src)}
                      className={`relative w-[84px] h-[84px] rounded-xl overflow-hidden border bg-white transition
                        ${
                          isActive
                            ? 'border-blue-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <Image
                        src={src}
                        alt={`thumb-${idx}`}
                        fill
                        unoptimized
                        className="object-contain p-2"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ================= RIGHT: INFO ================= */}
          <div className="space-y-5">
            {/* Brand + title */}
            <div>
              <p className="text-sm text-gray-500">{product.brandName}</p>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {product.productName}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <div className="text-3xl font-extrabold text-blue-600">
                {product.minPrice.toLocaleString()}đ
              </div>

              {product.minPrice !== product.maxPrice && (
                <div className="text-base text-gray-500 pb-1">
                  – {product.maxPrice.toLocaleString()}đ
                </div>
              )}
            </div>

            {/* Short description */}
            {product.description && (
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* ================= OPTIONS CARD ================= */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
              {/* ================= SIZE ================= */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Chọn Size</h3>

                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map(sizeName => {
                    const dbSize = product.sizeOptions.find(
                      s => s.sizeName?.toUpperCase() === sizeName
                    );

                    const sizeId = dbSize?.sizeId ?? null;
                    const existsInDb = !!dbSize;

                    const totalStock = sizeId
                      ? stockBySizeId.get(sizeId) ?? 0
                      : 0;

                    // có trong DB và stock > 0 thì mới cho chọn
                    const isAvailable = existsInDb && totalStock > 0;
                    const isSelected = selectedSizeId === sizeId;

                    return (
                      <button
                        key={sizeName}
                        disabled={!isAvailable}
                        onClick={() => {
                          if (!sizeId) return;

                          setSelectedSizeId(sizeId);
                          setSelectedColorId(null);
                          setQuantity(1);
                        }}
                        className={`h-10 min-w-[52px] px-4 rounded-xl border text-sm font-semibold transition
                            ${
                              isSelected && isAvailable
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-900 border-gray-200 hover:border-blue-400'
                            }
                            ${
                              !isAvailable
                                ? 'opacity-40 cursor-not-allowed hover:border-gray-200'
                                : ''
                            }
                        `}
                      >
                        {sizeName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ================= COLOR ================= */}
              {selectedSizeId && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Chọn màu sắc
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {product.colorOptions.map(color => {
                      const totalStock =
                        stockByColorIdForSelectedSize.get(color.colorId) ?? 0;

                      const isAvailable = totalStock > 0;
                      const isSelected = selectedColorId === color.colorId;

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
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-800 border-gray-200 hover:border-blue-400'
                            }
                            ${
                              !isAvailable
                                ? 'opacity-40 cursor-not-allowed hover:border-gray-200'
                                : ''
                            }
                          `}
                        >
                          {color.colorName}

                          {!isAvailable && (
                            <span className="absolute -top-2 -right-2 text-[10px] font-bold px-2 py-[2px] rounded-full bg-gray-900 text-white">
                              Hết hàng
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ================= QUANTITY ================= */}
              {matchedVariant && (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">
                      Số lượng
                    </span>

                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-11 h-10 grid place-items-center hover:bg-gray-50"
                      >
                        −
                      </button>

                      <div className="w-12 text-center font-semibold text-gray-900">
                        {quantity}
                      </div>

                      <button
                        onClick={() =>
                          setQuantity(q =>
                            Math.min(matchedVariant.stockQuantity, q + 1)
                          )
                        }
                        className="w-11 h-10 grid place-items-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Còn{' '}
                    <span className="font-semibold">
                      {matchedVariant.stockQuantity}
                    </span>{' '}
                    sản phẩm
                  </div>
                </div>
              )}

              {/* ================= ACTION BUTTONS ================= */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <button
                  disabled={!matchedVariant}
                  className={`h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition
                    ${
                      matchedVariant
                        ? 'bg-white border border-blue-600 text-blue-700 hover:bg-blue-50'
                        : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Thêm vào giỏ
                </button>

                <button
                  disabled={!matchedVariant}
                  className={`h-12 rounded-xl font-semibold text-white transition
                    ${
                      matchedVariant
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  Mua ngay
                </button>
              </div>

              {/* ================= BENEFITS ================= */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                  <Truck className="w-5 h-5 text-gray-700" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Miễn phí vận chuyển
                    </div>
                    <div className="text-xs text-gray-500">
                      Đơn hàng từ 1.000.000đ
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                  <ShieldCheck className="w-5 h-5 text-gray-700" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Bảo hành chính hãng
                    </div>
                    <div className="text-xs text-gray-500">
                      Cam kết 100% Authentic
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* end options card */}
          </div>
        </div>
      </section>

      {/* ================= CONTENT (Tabs like Figma) ================= */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200">
          <TabButton
            active={activeTab === 'description'}
            onClick={() => setActiveTab('description')}
          >
            Mô tả chi tiết
          </TabButton>

          <TabButton
            active={activeTab === 'specs'}
            onClick={() => setActiveTab('specs')}
          >
            Thông số sản phẩm
          </TabButton>

          <TabButton
            active={activeTab === 'policy'}
            onClick={() => setActiveTab('policy')}
          >
            Chính sách đổi trả
          </TabButton>
        </div>

        {/* Content area */}
        <div className="pt-8">
          {/* DESCRIPTION */}
          {activeTab === 'description' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {product.contentBlock.description ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Mô tả sản phẩm
                    </h2>

                    <div
                      className="prose max-w-none prose-p:leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: product.contentBlock.description.html
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-gray-600">
                    Chưa có mô tả chi tiết.
                  </div>
                )}

                {product.contentBlock.highlights.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Đặc điểm nổi bật
                    </h2>

                    <ul className="space-y-3">
                      {product.contentBlock.highlights.map((item, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="mt-1 w-2 h-2 rounded-full bg-green-600" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Specs right (like Figma) */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Thông số kỹ thuật
                  </h2>

                  {product.contentBlock.specs.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {product.contentBlock.specs.map((spec, i) => (
                        <div
                          key={i}
                          className="py-3 flex items-start justify-between gap-6"
                        >
                          <div className="text-sm text-gray-500">
                            {spec.label}
                          </div>
                          <div className="text-sm font-semibold text-gray-900 text-right">
                            {spec.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      Chưa có thông số.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SPECS TAB */}
          {activeTab === 'specs' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Thông số sản phẩm
              </h2>

              {product.contentBlock.specs.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full">
                    <tbody>
                      {product.contentBlock.specs.map((spec, i) => (
                        <tr key={i} className="border-b last:border-b-0">
                          <td className="w-[45%] p-4 bg-gray-50 font-semibold text-gray-700">
                            {spec.label}
                          </td>
                          <td className="p-4 text-gray-900">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-600">Chưa có thông số.</div>
              )}
            </div>
          )}

          {/* POLICY TAB */}
          {activeTab === 'policy' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Chính sách đổi trả
              </h2>

              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  - Hỗ trợ đổi size trong vòng <b>7 ngày</b> nếu sản phẩm còn
                  nguyên tem mác.
                </p>
                <p>
                  - Không hỗ trợ đổi trả với sản phẩm đã qua sử dụng hoặc giặt.
                </p>
                <p>- Sản phẩm lỗi do nhà sản xuất sẽ được đổi mới 1-1.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= REVIEWS ================= */}
      <ProductReviewsSection productId={product.productId} />

      <Footer />
    </main>
  );
}

/* ================= UI SMALL COMPONENT ================= */

function TabButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative py-4 text-sm font-semibold transition
        ${active ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}
      `}
    >
      {children}
      <span
        className={`absolute left-0 -bottom-[1px] h-[2px] w-full rounded-full transition
          ${active ? 'bg-blue-600' : 'bg-transparent'}
        `}
      />
    </button>
  );
}

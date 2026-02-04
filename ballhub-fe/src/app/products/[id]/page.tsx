'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';

import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { ProductDetail } from '@/types/product';

/* ================= PAGE ================= */

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  /* ================= FETCH ================= */
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`http://localhost:8080/api/products/${id}`);
        const json = await res.json();

        setProduct({
          ...json.data,
          // ✅ ép contentBlock LUÔN tồn tại
          contentBlock: json.data.contentBlock ?? {
            description: null,
            highlights: [],
            specs: []
          }
        });
      } catch (e) {
        console.error('❌ Load product failed', e);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  /* ================= VARIANT MATCH ================= */
  const matchedVariant = useMemo(() => {
    if (!product || !selectedSizeId || !selectedColorId) return null;

    return (
      product.variants.find(
        v => v.sizeId === selectedSizeId && v.colorId === selectedColorId
      ) ?? null
    );
  }, [product, selectedSizeId, selectedColorId]);

  /* ================= LOADING / EMPTY ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Không tìm thấy sản phẩm
      </div>
    );
  }

  /* ================= IMAGE ================= */
  const mainImage =
    product.images.find(i => i.isMain)?.imageUrl ||
    product.images[0]?.imageUrl ||
    null;

  const imageSrc = mainImage
    ? `http://localhost:8080${mainImage}`
    : '/no-image.png';

  /* ================= UI ================= */
  return (
    <main className="bg-gray-50 min-h-screen">
      <Header />

      {/* ================= TOP ================= */}
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* IMAGE */}
        <div className="bg-white rounded-xl p-6">
          <div className="relative aspect-square">
            <Image
              src={imageSrc}
              alt={product.productName}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
              className="object-contain"
            />
          </div>
        </div>

        {/* INFO */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500">{product.brandName}</p>
            <h1 className="text-2xl font-bold">{product.productName}</h1>
          </div>

          <p className="text-xl font-bold text-blue-600">
            {product.minPrice.toLocaleString()} đ
            {product.minPrice !== product.maxPrice &&
              ` – ${product.maxPrice.toLocaleString()} đ`}
          </p>

          <p className="text-gray-600">{product.description}</p>

          {/* SIZE */}
          <div>
            <h3 className="font-semibold mb-2">Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizeOptions.map(size => (
                <button
                  key={size.sizeId}
                  disabled={!size.available}
                  onClick={() => {
                    setSelectedSizeId(size.sizeId);
                    setSelectedColorId(null);
                    setQuantity(1);
                  }}
                  className={`px-4 py-2 border rounded-lg text-sm
                    ${
                      selectedSizeId === size.sizeId
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'hover:border-blue-600'
                    }
                    ${!size.available && 'opacity-40 cursor-not-allowed'}
                  `}
                >
                  {size.sizeName}
                </button>
              ))}
            </div>
          </div>

          {/* COLOR */}
          {selectedSizeId && (
            <div>
              <h3 className="font-semibold mb-2">Màu sắc</h3>
              <div className="flex flex-wrap gap-2">
                {product.colorOptions.map(color => {
                  const available = product.variants.some(
                    v =>
                      v.sizeId === selectedSizeId &&
                      v.colorId === color.colorId &&
                      v.stockQuantity > 0
                  );

                  return (
                    <button
                      key={color.colorId}
                      disabled={!available}
                      onClick={() => {
                        setSelectedColorId(color.colorId);
                        setQuantity(1);
                      }}
                      className={`px-4 py-2 border rounded-lg text-sm
                        ${
                          selectedColorId === color.colorId
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'hover:border-blue-600'
                        }
                        ${!available && 'opacity-40 cursor-not-allowed'}
                      `}
                    >
                      {color.colorName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUANTITY */}
          {matchedVariant && (
            <div className="flex items-center gap-4">
              <span className="font-semibold">Số lượng</span>

              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-1"
                >
                  −
                </button>

                <span className="px-4">{quantity}</span>

                <button
                  onClick={() =>
                    setQuantity(q =>
                      Math.min(matchedVariant.stockQuantity, q + 1)
                    )
                  }
                  className="px-3 py-1"
                >
                  +
                </button>
              </div>

              <span className="text-sm text-gray-500">
                Còn {matchedVariant.stockQuantity} sản phẩm
              </span>
            </div>
          )}

          {/* ADD TO CART */}
          <button
            disabled={!matchedVariant}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold
              ${
                matchedVariant
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }
            `}
          >
            <ShoppingCart className="w-5 h-5" />
            Thêm vào giỏ
          </button>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* DESCRIPTION */}
        {product.contentBlock.description && (
          <section className="mt-12">
            <h2 className="text-xl font-bold mb-4">Mô tả sản phẩm</h2>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: product.contentBlock.description.html
              }}
            />
          </section>
        )}

        {/* HIGHLIGHTS */}
        {product.contentBlock.highlights.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold mb-4">Đặc điểm nổi bật</h2>
            <ul className="list-disc pl-6 space-y-2">
              {product.contentBlock.highlights.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {/* SPECS */}
        {product.contentBlock.specs.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold mb-4">Thông số kỹ thuật</h2>
            <table className="w-full border">
              <tbody>
                {product.contentBlock.specs.map((spec, i) => (
                  <tr key={i}>
                    <td className="p-3 bg-gray-50 font-medium">{spec.label}</td>
                    <td className="p-3">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
}

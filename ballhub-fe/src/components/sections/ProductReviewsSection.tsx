'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReviewItem, ReviewResponse } from '@/types/review';

function formatDateVN(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return dateStr;
  }
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-[2px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-base ${
            i < value ? 'text-orange-400' : 'text-gray-300'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function ProductReviewsSection({ productId }: { productId: number }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReviewResponse | null>(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formMessage, setFormMessage] = useState<string | null>(null);

  // ✅ check login 1 lần khi component mount
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const items = useMemo(() => data?.items ?? [], [data]);

  async function loadReviews() {
    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:8080/api/products/${productId}/reviews`,
        { cache: 'no-store' }
      );

      const json = await res.json();
      setData(json.data);
    } catch (e) {
      console.error('Load reviews failed', e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (productId) loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    // ✅ auto check token
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);

    if (!token) {
      setFormMessage('Bạn cần đăng nhập để đánh giá sản phẩm.');
    } else {
      setFormMessage(null);
    }
  }, []);

  async function submitReview() {
    setFormMessage(null);

    const token = localStorage.getItem('accessToken');

    if (!token) {
      setFormMessage('Bạn cần đăng nhập để đánh giá sản phẩm.');
      return;
    }

    if (rating < 1) {
      setFormMessage('Bạn chưa chọn số sao.');
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(
        `http://localhost:8080/api/products/${productId}/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            rating,
            comment // không bắt buộc
          })
        }
      );

      const json = await res.json();

      if (!res.ok) {
        setFormMessage(json.message || 'Gửi đánh giá thất bại.');
        return;
      }

      setRating(0);
      setComment('');
      setFormMessage('Gửi đánh giá thành công!');

      await loadReviews();
    } catch (e) {
      console.error(e);
      setFormMessage('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = isLoggedIn && rating >= 1 && !submitting;

  return (
    <section className="max-w-6xl mx-auto px-4 pb-16">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Đánh giá sản phẩm</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ================= LEFT ================= */}
        <div className="lg:col-span-2 space-y-4">
          {/* summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between gap-6">
            <div>
              <div className="text-sm text-gray-500">Đánh giá trung bình</div>
              <div className="text-3xl font-extrabold text-gray-900 mt-1">
                {data?.avgRating ?? 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {data?.totalReviews ?? 0} đánh giá
              </div>
            </div>

            <Stars value={Math.round(data?.avgRating ?? 0)} />
          </div>

          {/* list */}
          {loading && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-gray-600">
              Đang tải đánh giá...
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-gray-600">
              Chưa có đánh giá nào.
            </div>
          )}

          {!loading &&
            items.map(r => (
              <div
                key={r.reviewId}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">
                    {r.fullName?.trim()?.[0]?.toUpperCase() ?? 'U'}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {r.fullName}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDateVN(r.createdAt)}
                        </div>
                      </div>

                      <Stars value={r.rating} />
                    </div>

                    <p className="text-gray-700 mt-3 leading-relaxed whitespace-pre-line">
                      {r.comment || (
                        <span className="text-gray-400 italic">
                          (Không có nội dung)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* ================= RIGHT: FORM ================= */}
        <div className="lg:col-span-1">
          <div className="bg-[#F3F4F6] rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">
              Viết đánh giá của bạn
            </h3>

            {/* login message */}
            {!isLoggedIn && (
              <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm font-semibold text-gray-900">
                  Bạn cần đăng nhập
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Đăng nhập để có thể đánh giá sản phẩm này.
                </div>
              </div>
            )}

            <div className={`mb-4 ${!isLoggedIn ? 'opacity-50' : ''}`}>
              <div className="text-sm font-semibold text-gray-800 mb-2">
                Đánh giá tổng quan
              </div>

              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const star = i + 1;
                  const active = star <= rating;

                  return (
                    <button
                      key={star}
                      type="button"
                      disabled={!isLoggedIn}
                      onClick={() => {
                        setRating(star);
                        setFormMessage(null);
                      }}
                      className={`text-2xl transition ${
                        active ? 'text-orange-400' : 'text-gray-300'
                      } ${!isLoggedIn ? 'cursor-not-allowed' : ''}`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`mb-4 ${!isLoggedIn ? 'opacity-50' : ''}`}>
              <div className="text-sm font-semibold text-gray-800 mb-2">
                Nội dung (không bắt buộc)
              </div>

              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                disabled={!isLoggedIn}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này"
                rows={5}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 bg-white resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* message */}
            {formMessage && (
              <div
                className={`mb-4 text-sm font-semibold ${
                  formMessage.includes('thành công')
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {formMessage}
              </div>
            )}

            <button
              type="button"
              onClick={submitReview}
              disabled={!canSubmit}
              className={`w-full h-12 rounded-xl font-semibold text-white transition
                ${
                  !isLoggedIn
                    ? 'bg-gray-400 cursor-not-allowed'
                    : submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : rating < 1
                    ? 'bg-gray-800 hover:bg-black'
                    : 'bg-gray-900 hover:bg-black'
                }
              `}
            >
              {!isLoggedIn
                ? 'Đăng nhập để đánh giá'
                : submitting
                ? 'Đang gửi...'
                : 'Gửi đánh giá'}
            </button>

            {/* hint nhỏ */}
            {isLoggedIn && rating < 1 && (
              <div className="mt-3 text-xs text-gray-500">
                * Bạn cần chọn số sao trước khi gửi.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

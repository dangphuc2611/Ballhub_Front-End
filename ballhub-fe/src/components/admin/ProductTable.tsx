import Image from "next/image";
import { StatusTag } from "./StatusTag";

type Props = {
  products?: any[];
  page?: number;
  totalPages?: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onEdit?: (productId: number) => void;
};

export const ProductTable = ({
  products = [],
  page = 0,
  totalPages = 1,
  totalElements,
  pageSize = 12,
  onPageChange,
  onEdit,
}: Props) => {
  const totalCount = totalElements ?? products.length;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const goTo = (p: number) => {
    if (!onPageChange) return;
    if (p < 0 || p >= (totalPages || 1)) return;
    onPageChange(p);
  };

  const formatPrice = (price: any) => {
    if (price === null || price === undefined) return "0đ";
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "0đ";
    return numPrice.toLocaleString("vi-VN") + "đ";
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-lg">Sản phẩm hiện có</h3>
          <p className="text-xs text-slate-400">Tất cả {totalCount} mặt hàng</p>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead className="text-slate-400 text-[11px] uppercase tracking-wider">
          <tr>
<<<<<<< HEAD
            <th className="text-left pb-4 w-10">STT</th>
=======
            <th className="text-left pb-4 w-12">STT</th>
>>>>>>> ae72dbc (done)
            <th className="text-left pb-4">Sản phẩm</th>
            <th className="text-left pb-4">Hãng</th>
            <th className="text-left pb-4">Giá bán</th>
            <th className="text-left pb-4">Trạng thái</th>
            <th className="text-right pb-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {products.map((p, index) => (
            <tr
              key={p.productId}
              className="hover:bg-slate-50/50 transition-colors group"
            >
<<<<<<< HEAD
              <td className="py-4 text-slate-400 font-medium">
=======
              <td className="py-4 text-slate-400 font-medium text-xs">
>>>>>>> ae72dbc (done)
                {page * pageSize + index + 1}
              </td>
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <Image
                    src={`http://localhost:8080` + p.mainImage}
                    width={50}
                    height={50}
                    alt={p.productName}
                  />
                  <div>
                    <p className="font-bold text-slate-700">{p.productName}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter truncate max-w-[200px]">
                      {p.description}
                    </p>
                  </div>
                </div>
              </td>
              <td className="font-bold text-slate-600">{p.brandName}</td>
<<<<<<< HEAD
              
              <td className="font-bold text-emerald-600">{formatPrice(p.maxPrice)}</td>
              
              <td>
                <StatusTag
                  label={p.status ? "Hoạt động" : "Tạm khóa"}
=======
              <td className="font-bold text-slate-600">{formatPrice(p.maxPrice)}</td>
              {/* <td className="text-slate-500 font-medium">{p.stock}</td> */}
              <td>
                <StatusTag
                  label={p.status ? "Hoạt Động" : "Không Hoạt Động"}
>>>>>>> ae72dbc (done)
                  color={p.status ? "green" : "red"}
                />
              </td>
              <td className="text-right">
                <button
                  onClick={() => onEdit?.(p.productId)}
                  className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                  title="Sửa sản phẩm"
                >
                  ✎
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Hiển thị trang {page + 1} / {totalPages || 1}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page <= 0}
            className="px-3 py-1 rounded-md bg-white border text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
<<<<<<< HEAD
            Trang trước
=======
            Trước
>>>>>>> ae72dbc (done)
          </button>

          {[...Array(totalPages || 1)].map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${i === page ? "bg-emerald-500 text-white shadow-sm" : "bg-white border hover:bg-slate-50"}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => goTo(page + 1)}
            disabled={page >= (totalPages || 1) - 1}
            className="px-3 py-1 rounded-md bg-white border text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
<<<<<<< HEAD
            Trang sau
=======
            Sau
>>>>>>> ae72dbc (done)
          </button>
        </div>
      </div>
    </div>
  );
};
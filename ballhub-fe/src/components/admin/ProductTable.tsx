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

  const goTo = (p: number) => {
    if (!onPageChange) return;
    if (p < 0 || p >= (totalPages || 1)) return;
    onPageChange(p);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-lg">Sản phẩm hiện có</h3>
          <p className="text-xs text-slate-400">Tất cả {totalCount} mặt hàng</p>
        </div>
        {/* <div className="flex bg-slate-50 p-1 rounded-lg">
          <button className="px-4 py-1.5 text-xs font-bold bg-white shadow-sm rounded-md">
            Tất cả
          </button>
          <button className="px-4 py-1.5 text-xs text-slate-400 hover:text-slate-600">
            Đang bán
          </button>
        </div> */}
      </div>
      <table className="w-full text-sm">
        <thead className="text-slate-400 text-[11px] uppercase tracking-wider">
          <tr>
            <th className="text-left pb-4">Sản phẩm</th>
            <th className="text-left pb-4">Hãng</th>
            <th className="text-left pb-4">Giá bán</th>
            <th className="text-left pb-4">Trạng thái</th>
            <th className="text-right pb-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {products.map((p) => (
            <tr
              key={p.productId}
              className="hover:bg-slate-50/50 transition-colors group"
            >
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <Image
                    src={`http://localhost:8080` + p.mainImage}
                    width={50}
                    height={50}
                    alt={p.description}
                  />
                  <div>
                    <p className="font-bold text-slate-700">{p.productName}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">
                      {p.description}
                    </p>
                  </div>
                </div>
              </td>
              <td className="font-bold text-slate-600">{p.brandName}</td>
              <td className="font-bold text-slate-600">{p.maxPrice}</td>
              {/* <td className="text-slate-500 font-medium">{p.stock}</td> */}
              <td>
                <StatusTag
                  label={p.status ? "Active" : "Inactive"}
                  color={p.status ? "green" : "red"}
                />
              </td>
              <td className="text-right">
                <button
                  onClick={() => onEdit?.(p.productId)}
                  className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
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
          Hiển thị trang {page + 1} / {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page <= 0}
            className="px-3 py-1 rounded-md bg-white border text-sm"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`px-3 py-1 rounded-md text-sm ${i === page ? "bg-emerald-500 text-white" : "bg-white border"}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => goTo(page + 1)}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 rounded-md bg-white border text-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

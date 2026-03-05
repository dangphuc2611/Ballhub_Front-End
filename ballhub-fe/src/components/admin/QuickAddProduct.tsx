"use client";

import { useState } from "react";
import { Plus, ShoppingCart, AlertCircle, CheckCircle } from "lucide-react";
import axios from "@/lib/axios";

interface FormData {
  productName: string;
  description: string;
  categoryId: string;
  brandId: string;
  price: string;
  stockQuantity: string;
  sizeId: string;
  colorId: string;
  sku: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

const InputGroup = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: any) => (
  <div className="flex flex-col gap-2 flex-1">
    <label className="text-xs font-bold text-slate-700">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-all"
    />
  </div>
);

export const QuickAddProduct = () => {
  const [formData, setFormData] = useState<FormData>({
    productName: "",
    description: "",
    categoryId: "",
    brandId: "",
    price: "",
    stockQuantity: "",
    sizeId: "",
    colorId: "",
    sku: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validação básica
      if (
        !formData.productName ||
        !formData.description ||
        !formData.categoryId ||
        !formData.brandId ||
        !formData.price ||
        !formData.stockQuantity ||
        !formData.sizeId ||
        !formData.colorId ||
        !formData.sku
      ) {
        setMessage({
          type: "error",
          text: "Por favor, preencha todos os campos",
        });
        setLoading(false);
        return;
      }

      const payload = {
        productName: formData.productName,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        brandId: parseInt(formData.brandId),
        variants: [
          {
            sizeId: parseInt(formData.sizeId),
            colorId: parseInt(formData.colorId),
            price: parseInt(formData.price),
            stockQuantity: parseInt(formData.stockQuantity),
            sku: formData.sku,
          },
        ],
      };

      const response = await axios.post("/admin/products", payload);

      if (response.status === 200 || response.status === 201) {
        setMessage({
          type: "success",
          text: "Produto adicionado com sucesso!",
        });
        // Limpar form
        setFormData({
          productName: "",
          description: "",
          categoryId: "",
          brandId: "",
          price: "",
          stockQuantity: "",
          sizeId: "",
          colorId: "",
          sku: "",
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erro ao adicionar produto";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 sticky top-8">
      <div className="flex items-center gap-2 text-emerald-600">
        <Plus size={20} strokeWidth={3} />
        <h3 className="font-bold text-slate-800">Thêm nhanh</h3>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
        >
          {message.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputGroup
          label="Tên sản phẩm"
          placeholder="Ví dụ: Giày đá bóng Adidas..."
          value={formData.productName}
          onChange={(e: any) =>
            handleInputChange("productName", e.target.value)
          }
        />

        <InputGroup
          label="Mô tả"
          placeholder="Ví dụ: Giày đá bóng sân cỏ nhân tạo..."
          value={formData.description}
          onChange={(e: any) =>
            handleInputChange("description", e.target.value)
          }
        />

        <div className="flex gap-4 flex-col">
          <InputGroup
            label="ID Danh mục"
            placeholder="1"
            type="number"
            value={formData.categoryId}
            onChange={(e: any) =>
              handleInputChange("categoryId", e.target.value)
            }
          />
          <InputGroup
            label="ID Thương hiệu"
            placeholder="2"
            type="number"
            value={formData.brandId}
            onChange={(e: any) => handleInputChange("brandId", e.target.value)}
          />
        </div>

        <div className="flex gap-4 flex-col">
          <InputGroup
            label="Giá"
            placeholder="1290000"
            type="number"
            value={formData.price}
            onChange={(e: any) => handleInputChange("price", e.target.value)}
          />
          <InputGroup
            label="Số lượng"
            placeholder="10"
            type="number"
            value={formData.stockQuantity}
            onChange={(e: any) =>
              handleInputChange("stockQuantity", e.target.value)
            }
          />
        </div>

        <div className="flex gap-4 flex-col">
          <InputGroup
            label="ID Size"
            placeholder="1"
            type="number"
            value={formData.sizeId}
            onChange={(e: any) => handleInputChange("sizeId", e.target.value)}
          />
          <InputGroup
            label="ID Màu"
            placeholder="3"
            type="number"
            value={formData.colorId}
            onChange={(e: any) => handleInputChange("colorId", e.target.value)}
          />
        </div>

        <InputGroup
          label="SKU"
          placeholder="PRED-39-RED"
          value={formData.sku}
          onChange={(e: any) => handleInputChange("sku", e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 disabled:bg-slate-400 shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} />
          {loading ? "Đang lưu..." : "Lưu & Hiển thị ngay"}
        </button>
      </form>
    </div>
  );
};

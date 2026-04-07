"use client";

import React, { useState } from "react";
import {
  Eye,
  Lock,
  Unlock,
  Key,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { UserProfileModal } from "./UserProfileModal";

export const UserTable = ({
  users = [],
  onRefresh,
}: {
  users?: any[];
  onRefresh: () => void;
}) => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ open: false, title: "", description: "", action: () => {} });

  // Hàm xử lý đường dẫn Avatar
  const getAvatarUrl = (user: any) => {
    if (!user.avatar) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "User")}&background=random&color=fff&size=128`;
    }
    if (user.avatar.startsWith("http")) {
      return user.avatar;
    }
    // Nếu là ảnh tải lên, ghép nối với cổng Backend 8080
    return `http://localhost:8080${user.avatar.startsWith("/") ? "" : "/"}${user.avatar}`;
  };

  const handleToggleStatus = (user: any) => {
    if (user.role === "ADMIN") {
      toast.error("Không thể khóa tài khoản Quản trị viên!");
      return;
    }
    setConfirmState({
      open: true,
      title: user.status ? "Khóa tài khoản?" : "Mở khóa tài khoản?",
      description: user.status
        ? `Bạn có chắc muốn KHÓA tài khoản ${user.email}? Khách sẽ không thể đăng nhập.`
        : `Cho phép tài khoản ${user.email} hoạt động trở lại?`,
      action: async () => {
        try {
          await api.put(`/users/admin/${user.userId}/toggle-status`);
          toast.success("Thay đổi trạng thái thành công!");
          onRefresh();
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Lỗi đổi trạng thái");
        } finally {
          setConfirmState((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleChangeRole = (user: any) => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    setConfirmState({
      open: true,
      title: `Chuyển quyền thành ${newRole}?`,
      description: `Bạn đang thay đổi quyền của ${user.email} thành ${newRole}. Xác nhận?`,
      action: async () => {
        try {
          await api.put(
            `/users/admin/${user.userId}/change-role?role=${newRole}`,
          );
          toast.success("Cập nhật quyền thành công!");
          onRefresh();
        } catch (error: any) {
          toast.error("Lỗi khi đổi quyền");
        } finally {
          setConfirmState((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleResetPassword = (user: any) => {
    setConfirmState({
      open: true,
      title: "Cấp lại mật khẩu?",
      description: `Hệ thống sẽ tạo mật khẩu ngẫu nhiên và gửi vào email ${user.email}.`,
      action: async () => {
        try {
          const promise = api.post(
            `/users/admin/${user.userId}/reset-password`,
          );
          toast.promise(promise, {
            loading: "Đang tạo và gửi mail...",
            success: "Đã gửi mật khẩu mới cho khách!",
            error: "Lỗi khi gửi mail",
          });
          await promise;
        } finally {
          setConfirmState((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  // ✅ HÀM MỚI: XỬ LÝ XÓA TÀI KHOẢN
  const handleDeleteUser = (user: any) => {
    if (user.role === "ADMIN") {
      toast.error("Không thể xóa tài khoản Quản trị viên!");
      return;
    }
    setConfirmState({
      open: true,
      title: "Xóa vĩnh viễn tài khoản?",
      description: `Hành động này sẽ XÓA SẠCH dữ liệu của ${user.email} và KHÔNG THỂ khôi phục. Cân nhắc dùng nút "Khóa" thay thế.`,
      action: async () => {
        try {
          await api.delete(`/users/admin/${user.userId}`);
          toast.success("Đã xóa vĩnh viễn tài khoản!");
          onRefresh();
        } catch (error: any) {
          // Bắt lỗi nếu tài khoản đã có đơn hàng
          toast.error(error.response?.data?.message || "Lỗi khi xóa tài khoản");
        } finally {
          setConfirmState((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-slate-800">Quản lý người dùng</h3>
      </div>
      <table className="w-full text-sm">
        <thead className="text-slate-400 text-[11px] uppercase border-b border-slate-50">
          <tr>
            <th className="text-left pb-4 w-12">STT</th>
            <th className="text-left pb-4">Người dùng</th>
            <th className="text-left pb-4">Liên hệ</th>
            <th className="text-left pb-4">Vai trò</th>
            <th className="text-left pb-4">Trạng thái</th>
            <th className="text-right pb-4">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {users && users.length > 0 ? (
            users.map((user, index) => (
              <tr
                key={user.userId}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="py-4 text-slate-400 font-medium text-xs">
                  {index + 1}
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={getAvatarUrl(user)}
                      className="w-9 h-9 rounded-full object-cover border border-slate-100"
                      alt="avatar"
                      onError={(e) => {
                        // Nếu ảnh trên Backend bị xóa mất, tự động lùi về Avatar chữ
                        (e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "User")}&background=random&color=fff&size=128`;
                      }}
                    />
                    <div>
                      <p className="font-bold text-xs text-slate-700">
                        {user.fullName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        ID: #{user.userId}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <p className="text-slate-600 text-xs font-medium">
                    {user.email}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {user.phone}
                  </p>
                </td>
                <td className="py-4">
                  <button
                    onClick={() => handleChangeRole(user)}
                    title="Click để đổi quyền"
                    className={`font-bold text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1 w-fit transition-all ${
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-600 hover:bg-purple-200"
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    }`}
                  >
                    {user.role === "ADMIN" ? (
                      <ShieldCheck size={12} />
                    ) : (
                      <ShieldAlert size={12} />
                    )}
                    {user.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
                  </button>
                </td>
                <td className="py-4">
                  <span
                    className={`font-bold text-[10px] px-2.5 py-1 rounded-md ${
                      user.status
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-rose-100 text-rose-600"
                    }`}
                  >
                    {user.status ? "Hoạt động" : "Bị khóa"}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowProfileModal(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      title="Xem hồ sơ"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleResetPassword(user)}
                      className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                      title="Cấp lại mật khẩu"
                    >
                      <Key size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`p-2 rounded-lg transition-all ${user.status ? "text-slate-400 hover:text-rose-500 hover:bg-rose-50" : "text-rose-500 hover:text-emerald-500 hover:bg-emerald-50"}`}
                      title={user.status ? "Khóa tài khoản" : "Mở khóa"}
                    >
                      {user.status ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Xóa vĩnh viễn"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={6}
                className="py-8 text-center text-slate-400 text-sm"
              >
                Không có người dùng
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        variant="danger"
        onClose={() => setConfirmState((prev) => ({ ...prev, open: false }))}
        onConfirm={confirmState.action}
      />

      {showProfileModal && selectedUser && (
        <UserProfileModal
          userId={selectedUser.userId}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
};

import { Eye } from "lucide-react";

export const UserTable = ({ users = [] }: { users?: any[] }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold text-lg text-slate-800">Quản lý người dùng</h3>
    </div>
    <table className="w-full text-sm">
      <thead className="text-slate-400 text-[11px] uppercase border-b border-slate-50">
        <tr>
          <th className="text-left pb-4">ID</th>
          <th className="text-left pb-4">Tên người dùng</th>
          <th className="text-left pb-4">Email</th>
          <th className="text-left pb-4">Số điện thoại</th>
          <th className="text-left pb-4">Vai trò</th>
          <th className="text-right pb-4"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {users && users.length > 0 ? (
          users.map((user) => (
            <tr
              key={user.userId}
              className="hover:bg-slate-50/50 transition-colors group"
            >
              <td className="py-4 font-bold text-emerald-600">
                #{user.userId}
              </td>
              <td className="py-4">
                <p className="font-bold text-xs text-slate-700">
                  {user.fullName}
                </p>
              </td>
              <td className="text-slate-500 text-xs">{user.email}</td>
              <td className="text-slate-500 text-xs">{user.phone}</td>
              <td>
                <span
                  className={`font-bold text-[11px] px-2.5 py-1.5 rounded-lg ${
                    user.role === "ADMIN"
                      ? "bg-purple-100 text-purple-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {user.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
                </span>
              </td>
              <td className="text-right">
                <button className="p-2 text-slate-300 hover:text-blue-500 transition-all">
                  <Eye size={16} />
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} className="py-4 text-center text-slate-400">
              Không có người dùng
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

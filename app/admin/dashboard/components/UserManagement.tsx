'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Mail, Calendar, Loader2, Users, Search, UserCheck, AlertCircle, UserX, RefreshCcw } from 'lucide-react';

export default function UserManagement() {
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'active' | 'deleted'>('active'); // Chế độ xem hiện tại

    const getToken = () => {
        const name = "token=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
        }
        return "";
    };

    const fetchUsers = async () => {
        setLoading(true);
        const token = getToken();
        if (!token) return;

        try {
            const res = await axios.get('http://localhost:3000/user/admin/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAllUsers(res.data);
        } catch (err) {
            console.error("Lỗi lấy danh sách user:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // ✅ ĐÌNH CHỈ (SOFT DELETE)
    const handleSuspend = async (id: string, email: string) => {
        if (!confirm(`Xác nhận đình chỉ tài khoản: ${email}?`)) return;
        try {
            await axios.delete(`http://localhost:3000/user/admin/${id}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            fetchUsers();
        } catch (err) {
            alert('Lỗi khi đình chỉ người dùng');
        }
    };

    // ✅ KHÔI PHỤC (RESTORE)
    const handleRestore = async (id: string, email: string) => {
        if (!confirm(`Xác nhận khôi phục tài khoản: ${email}?`)) return;
        try {
            await axios.patch(`http://localhost:3000/user/admin/${id}/restore`, {}, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            fetchUsers();
        } catch (err) {
            alert('Lỗi khi khôi phục người dùng');
        }
    };

    // TÍNH TOÁN THỐNG KÊ
    const totalUsers = allUsers.length;
    const activeUsersCount = allUsers.filter(u => !u.isDeleted).length;
    const deletedUsersCount = allUsers.filter(u => u.isDeleted).length;

    // LỌC DỮ LIỆU ĐỂ HIỂN THỊ TRÊN BẢNG
    const displayedUsers = allUsers.filter(u => {
        const matchStatus = viewMode === 'active' ? !u.isDeleted : u.isDeleted;
        const matchSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchStatus && matchSearch;
    });

    return (
        <div className="space-y-6">

            {/* THỐNG KÊ TỔNG QUAN (3 THẺ) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Users size={24} /></div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Tổng tài khoản</p>
                        <h4 className="text-3xl font-black text-slate-800 leading-none">{totalUsers}</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center"><UserCheck size={24} /></div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Đang hoạt động</p>
                        <h4 className="text-3xl font-black text-slate-800 leading-none">{activeUsersCount}</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center"><UserX size={24} /></div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Đã đình chỉ</p>
                        <h4 className="text-3xl font-black text-slate-800 leading-none">{deletedUsersCount}</h4>
                    </div>
                </div>
            </div>

            {/* THANH ĐIỀU HƯỚNG & TÌM KIẾM */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-[24px] border border-slate-200/60 shadow-sm">

                {/* TABS CHUYỂN ĐỔI CHẾ ĐỘ XEM */}
                <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-100 w-full md:w-auto">
                    <button
                        onClick={() => setViewMode('active')}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${viewMode === 'active' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Tài khoản hoạt động
                    </button>
                    <button
                        onClick={() => setViewMode('deleted')}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${viewMode === 'deleted' ? 'bg-white text-red-500 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Tài khoản bị đình chỉ
                    </button>
                </div>

                {/* Ô TÌM KIẾM */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm email thành viên..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* BẢNG DANH SÁCH */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200/60 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Thông tin tài khoản</th>
                            <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Tham gia</th>
                            <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                            <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">
                                {viewMode === 'active' ? 'Đình chỉ' : 'Khôi phục'}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="py-20 text-center">
                                    <Loader2 className="animate-spin mx-auto text-blue-500" />
                                </td>
                            </tr>
                        ) : displayedUsers.length > 0 ? (
                            displayedUsers.map((u) => (
                                <tr key={u._id} className={`transition-colors group ${viewMode === 'active' ? 'hover:bg-slate-50/50' : 'hover:bg-red-50/30'}`}>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border shadow-inner ${viewMode === 'active' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-red-50 text-red-400 border-red-100'}`}>
                                                {u.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`font-bold ${viewMode === 'active' ? 'text-slate-700' : 'text-red-500 line-through opacity-70'}`}>
                                                    {u.email.split('@')[0]}
                                                </span>
                                                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                                    <Mail size={10} /> {u.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="text-xs font-bold text-slate-500 flex items-center justify-center gap-1">
                                            <Calendar size={14} className="text-slate-300" />
                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        {viewMode === 'active' ? (
                                            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-100 inline-flex items-center gap-1">
                                                <UserCheck size={10} /> Active
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-100 inline-flex items-center gap-1">
                                                <AlertCircle size={10} /> Bị đình chỉ
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {viewMode === 'active' ? (
                                            <button
                                                onClick={() => handleSuspend(u._id, u.email)}
                                                className="p-2 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                title="Đình chỉ tài khoản"
                                            >
                                                <AlertCircle size={20} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRestore(u._id, u.email)}
                                                className="p-2 text-slate-300 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                title="Khôi phục tài khoản"
                                            >
                                                <RefreshCcw size={20} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-24 text-center">
                                    <div className="inline-flex flex-col items-center justify-center text-slate-400">
                                        {viewMode === 'active' ? <Users size={48} className="opacity-20 mb-4" /> : <UserX size={48} className="opacity-20 mb-4" />}
                                        <p className="font-bold uppercase tracking-widest text-sm">
                                            {viewMode === 'active' ? 'Không có tài khoản nào hoạt động' : 'Không có tài khoản nào bị đình chỉ'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
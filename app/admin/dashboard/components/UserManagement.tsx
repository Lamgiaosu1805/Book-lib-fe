'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Trash2, Mail, Calendar, Loader2, Users, Search, UserCheck, AlertCircle, UserX, RefreshCcw } from 'lucide-react';
import { useDialog } from '@/app/components/Dialog';

export default function UserManagement() {
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'active' | 'deleted'>('active');
    const { confirm, error, dialog } = useDialog();

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
            const res = await api.get('/user/admin/all', {
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

    const handleSuspend = async (id: string, email: string) => {
        const ok = await confirm(`Đình chỉ tài khoản "${email}"?`, { title: 'Xác nhận đình chỉ', confirmText: 'Đình chỉ' });
        if (!ok) return;
        try {
            await api.delete(`/user/admin/${id}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
            fetchUsers();
        } catch {
            error('Lỗi khi đình chỉ người dùng');
        }
    };

    const handleRestore = async (id: string, email: string) => {
        const ok = await confirm(`Khôi phục tài khoản "${email}"?`, { title: 'Xác nhận khôi phục', confirmText: 'Khôi phục' });
        if (!ok) return;
        try {
            await api.patch(`/user/admin/${id}/restore`, {}, { headers: { 'Authorization': `Bearer ${getToken()}` } });
            fetchUsers();
        } catch {
            error('Lỗi khi khôi phục người dùng');
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
        <>
        {dialog}
        <div className="space-y-6">

            {/* THỐNG KÊ TỔNG QUAN (3 THẺ) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl flex items-center gap-5"
                     style={{ background: '#FFFDF8', border: '1px solid #E5D5B5' }}>
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                         style={{ background: '#F9F5EE', color: '#3B0E1E', border: '1px solid #E5D5B5' }}><Users size={24} /></div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: '#9a7070' }}>Tổng tài khoản</p>
                        <h4 className="text-3xl font-black leading-none" style={{ color: '#3B0E1E' }}>{totalUsers}</h4>
                    </div>
                </div>
                <div className="p-6 rounded-2xl flex items-center gap-5"
                     style={{ background: '#FFFDF8', border: '1px solid #E5D5B5' }}>
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                         style={{ background: '#f0fdf4', color: '#22c55e', border: '1px solid #bbf7d0' }}><UserCheck size={24} /></div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: '#9a7070' }}>Đang hoạt động</p>
                        <h4 className="text-3xl font-black leading-none" style={{ color: '#3B0E1E' }}>{activeUsersCount}</h4>
                    </div>
                </div>
                <div className="p-6 rounded-2xl flex items-center gap-5"
                     style={{ background: '#FFFDF8', border: '1px solid #E5D5B5' }}>
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                         style={{ background: '#fff5f5', color: '#ef4444', border: '1px solid #fecdd3' }}><UserX size={24} /></div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: '#9a7070' }}>Đã đình chỉ</p>
                        <h4 className="text-3xl font-black leading-none" style={{ color: '#3B0E1E' }}>{deletedUsersCount}</h4>
                    </div>
                </div>
            </div>

            {/* THANH ĐIỀU HƯỚNG & TÌM KIẾM */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 rounded-2xl"
                 style={{ background: '#FFFDF8', border: '1px solid #E5D5B5' }}>

                {/* TABS CHUYỂN ĐỔI CHẾ ĐỘ XEM */}
                <div className="flex p-1 rounded-xl w-full md:w-auto" style={{ background: '#F9F5EE', border: '1px solid #E5D5B5' }}>
                    <button
                        onClick={() => setViewMode('active')}
                        className="flex-1 md:flex-none px-6 py-2.5 rounded-lg font-bold text-sm transition-all"
                        style={{
                            background: viewMode === 'active' ? '#3B0E1E' : 'transparent',
                            color: viewMode === 'active' ? '#C9A227' : '#7a3a46',
                        }}
                    >
                        Tài khoản hoạt động
                    </button>
                    <button
                        onClick={() => setViewMode('deleted')}
                        className="flex-1 md:flex-none px-6 py-2.5 rounded-lg font-bold text-sm transition-all"
                        style={{
                            background: viewMode === 'deleted' ? '#7B1A1A' : 'transparent',
                            color: viewMode === 'deleted' ? '#fca5a5' : '#7a3a46',
                        }}
                    >
                        Tài khoản bị đình chỉ
                    </button>
                </div>

                {/* Ô TÌM KIẾM */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#9a7070' }} size={18} />
                    <input
                        type="text"
                        placeholder="Tìm email thành viên..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all font-medium text-sm"
                        style={{ background: '#F9F5EE', border: '1.5px solid #E5D5B5', color: '#3B0E1E' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* BẢNG DANH SÁCH */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFDF8', border: '1px solid #E5D5B5' }}>
                <table className="w-full text-left border-collapse">
                    <thead style={{ background: '#F9F5EE', borderBottom: '1px solid #E5D5B5' }}>
                        <tr>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest" style={{ color: '#9a7070' }}>Thông tin tài khoản</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center" style={{ color: '#9a7070' }}>Tham gia</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center" style={{ color: '#9a7070' }}>Trạng thái</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right" style={{ color: '#9a7070' }}>
                                {viewMode === 'active' ? 'Đình chỉ' : 'Khôi phục'}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="py-20 text-center">
                                    <Loader2 className="animate-spin mx-auto" style={{ color: '#C9A227' }} />
                                </td>
                            </tr>
                        ) : displayedUsers.length > 0 ? (
                            displayedUsers.map((u, index) => (
                                <tr key={u._id} className="transition-colors hover:bg-[#FAF7F2]"
                                    style={{ borderBottom: index < displayedUsers.length - 1 ? '1px solid #F5EDD8' : 'none' }}>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-black border"
                                                 style={{
                                                     background: viewMode === 'active' ? '#F9F5EE' : '#fff5f5',
                                                     color: viewMode === 'active' ? '#3B0E1E' : '#ef4444',
                                                     borderColor: viewMode === 'active' ? '#E5D5B5' : '#fecdd3',
                                                 }}>
                                                {u.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold"
                                                      style={{ color: viewMode === 'active' ? '#3B0E1E' : '#ef4444', textDecoration: viewMode === 'deleted' ? 'line-through' : 'none' }}>
                                                    {u.email.split('@')[0]}
                                                </span>
                                                <span className="text-[11px] font-medium flex items-center gap-1" style={{ color: '#9a7070' }}>
                                                    <Mail size={10} /> {u.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="text-xs font-bold flex items-center justify-center gap-1" style={{ color: '#7a3a46' }}>
                                            <Calendar size={14} style={{ color: '#C9A227' }} />
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
                                                className="p-2 rounded-lg transition-all"
                                                style={{ color: '#f97316', border: '1px solid #fed7aa', background: '#fff7ed' }}
                                                title="Đình chỉ tài khoản"
                                            >
                                                <AlertCircle size={20} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRestore(u._id, u.email)}
                                                className="p-2 rounded-lg transition-all"
                                                style={{ color: '#22c55e', border: '1px solid #bbf7d0', background: '#f0fdf4' }}
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
                                    <div className="inline-flex flex-col items-center justify-center" style={{ color: '#9a7070' }}>
                                        {viewMode === 'active' ? <Users size={48} className="opacity-30 mb-4" /> : <UserX size={48} className="opacity-30 mb-4" />}
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
        </>
    );
}

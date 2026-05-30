'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { CheckCircle2, AlertCircle, Loader2, UserPlus } from 'lucide-react';

export default function AdminManagement() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [saintName, setSaintName] = useState('');

    const getToken = () => {
        const ca = document.cookie.split(';');
        for (const c of ca) {
            const t = c.trim();
            if (t.startsWith('token=')) return t.substring(6);
        }
        return '';
    };

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchAdmins = async () => {
        try {
            const res = await api.get('/admin/list', { headers: { Authorization: `Bearer ${getToken()}` } });
            setAdmins(res.data);
        } catch { }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAdmins(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post('/admin/create',
                { email, password, displayName, saintName },
                { headers: { Authorization: `Bearer ${getToken()}` } },
            );
            showToast('success', 'Tạo tài khoản admin thành công!');
            setEmail(''); setPassword(''); setDisplayName(''); setSaintName('');
            fetchAdmins();
        } catch (err: any) {
            showToast('error', err.response?.data?.message || 'Có lỗi xảy ra');
        } finally { setCreating(false); }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 14px', borderRadius: 10, outline: 'none',
        border: '1.5px solid #E5D5B5', background: '#F9F5EE', color: '#3B0E1E', fontSize: 13,
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {toast && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg font-semibold text-sm text-white"
                     style={{ background: toast.type === 'success' ? '#3B6E3B' : '#7B1A1A' }}>
                    {toast.type === 'success' ? <CheckCircle2 size={15}/> : <AlertCircle size={15}/>}
                    {toast.msg}
                </div>
            )}

            {/* Form tạo admin mới */}
            <div className="rounded-2xl p-6" style={{ background: '#FFFDF8', border: '1px solid #E5D5B5' }}>
                <h3 className="font-black text-base mb-1" style={{ color: '#3B0E1E' }}>
                    Tạo tài khoản quản trị viên
                </h3>
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-6 h-0.5" style={{ background: '#C9A227' }}/>
                    <p className="text-xs" style={{ color: '#9a7070' }}>Điền đầy đủ thông tin bên dưới</p>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                                   style={{ color: '#7a3a46' }}>Tên Thánh</label>
                            <input type="text" required value={saintName} onChange={e => setSaintName(e.target.value)}
                                placeholder="VD: Giuse, Phêrô, Maria..."
                                style={inputStyle}/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                                   style={{ color: '#7a3a46' }}>Họ và Tên</label>
                            <input type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)}
                                placeholder="VD: Nguyễn Văn A"
                                style={inputStyle}/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                               style={{ color: '#7a3a46' }}>Email đăng nhập</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            style={inputStyle}/>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                               style={{ color: '#7a3a46' }}>Mật khẩu</label>
                        <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="Tối thiểu 6 ký tự"
                            style={inputStyle}/>
                    </div>

                    <button type="submit" disabled={creating}
                        className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                        style={{ background: creating ? '#9a4a5a' : '#3B0E1E', color: '#C9A227', boxShadow: '0 4px 15px rgba(59,14,30,0.2)' }}>
                        {creating ? <Loader2 size={16} className="animate-spin"/> : <UserPlus size={16}/>}
                        {creating ? 'Đang tạo...' : 'Tạo tài khoản'}
                    </button>
                </form>
            </div>

            {/* Danh sách admin */}
            <div className="rounded-2xl p-6" style={{ background: '#FFFDF8', border: '1px solid #E5D5B5' }}>
                <h3 className="font-black text-base mb-1" style={{ color: '#3B0E1E' }}>
                    Danh sách quản trị viên
                </h3>
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-6 h-0.5" style={{ background: '#C9A227' }}/>
                    <p className="text-xs" style={{ color: '#9a7070' }}>{admins.length} tài khoản</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={24} className="animate-spin" style={{ color: '#C9A227' }}/>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {admins.map(admin => {
                            const fullName = [admin.saintName, admin.displayName].filter(Boolean).join(' ') || admin.email;
                            return (
                                <div key={admin._id} className="flex items-center gap-3 p-3 rounded-xl"
                                     style={{ background: '#F9F5EE', border: '1px solid #E5D5B5' }}>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white shrink-0"
                                         style={{ background: '#3B0E1E', border: '2px solid #C9A227' }}>
                                        {fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate" style={{ color: '#3B0E1E' }}>{fullName}</p>
                                        <p className="text-xs truncate" style={{ color: '#9a7070' }}>{admin.email}</p>
                                        {admin.saintName && (
                                            <p className="text-[10px] font-semibold italic" style={{ color: '#C9A227' }}>
                                                Tên Thánh: {admin.saintName}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
                                          style={{ background: 'rgba(201,162,39,0.15)', color: '#C9A227', border: '1px solid rgba(201,162,39,0.3)' }}>
                                        ADMIN
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

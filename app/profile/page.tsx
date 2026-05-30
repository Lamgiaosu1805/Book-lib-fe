'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { User, Lock, Library, Calendar, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [displayName, setDisplayName] = useState('');
    const [editingName, setEditingName] = useState(false);
    const [savingName, setSavingName] = useState(false);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNew, setConfirmNew] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const getToken = () => {
        const match = document.cookie.match(new RegExp('(^| )user_token=([^;]+)'));
        return match ? match[2] : '';
    };

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const token = getToken();
        if (!token) { router.push('/login'); return; }

        api.get('/user/profile', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => { setProfile(res.data); setDisplayName(res.data.displayName || ''); })
            .catch(() => router.push('/login'))
            .finally(() => setLoading(false));
    }, []);

    const handleSaveName = async () => {
        setSavingName(true);
        try {
            await api.patch('/user/profile', { displayName }, { headers: { Authorization: `Bearer ${getToken()}` } });
            setProfile((p: any) => ({ ...p, displayName }));
            setEditingName(false);
            showToast('success', 'Cập nhật tên thành công!');
        } catch {
            showToast('error', 'Có lỗi xảy ra');
        } finally {
            setSavingName(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNew) {
            showToast('error', 'Mật khẩu mới xác nhận không khớp!');
            return;
        }
        if (newPassword.length < 6) {
            showToast('error', 'Mật khẩu mới phải có ít nhất 6 ký tự!');
            return;
        }
        setSaving(true);
        try {
            await api.patch('/user/profile/password',
                { oldPassword, newPassword },
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );
            showToast('success', 'Đổi mật khẩu thành công!');
            setOldPassword(''); setNewPassword(''); setConfirmNew('');
        } catch (err: any) {
            showToast('error', err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FB] font-sans pb-20">
            {/* TOAST */}
            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl shadow-lg font-bold text-sm animate-in slide-in-from-top-4 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {toast.msg}
                </div>
            )}

            {/* HEADER */}
            <header className="bg-white border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
                <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
                    <button onClick={() => router.push('/home')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-indigo-600">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-black text-slate-800">Hồ sơ cá nhân</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 mt-8 space-y-6">
                {/* THÔNG TIN TÀI KHOẢN */}
                <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-8">
                    <h2 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
                        <User size={20} className="text-indigo-500" /> Thông tin tài khoản
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-lg">
                                {(profile?.displayName || profile?.email)?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                {editingName ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={e => setDisplayName(e.target.value)}
                                            placeholder="Nhập tên hiển thị..."
                                            className="flex-1 px-3 py-1.5 rounded-xl border border-indigo-300 bg-white outline-none focus:ring-2 focus:ring-indigo-200 font-bold text-sm"
                                            autoFocus
                                        />
                                        <button onClick={handleSaveName} disabled={savingName} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all">
                                            {savingName ? '...' : 'Lưu'}
                                        </button>
                                        <button onClick={() => { setEditingName(false); setDisplayName(profile?.displayName || ''); }} className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl font-bold text-xs transition-all">
                                            Hủy
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <p className="font-black text-slate-800 truncate">
                                            {profile?.displayName || <span className="text-slate-400 font-medium italic">Chưa có tên</span>}
                                        </p>
                                        <button onClick={() => setEditingName(true)} className="text-xs text-indigo-500 hover:text-indigo-700 font-bold shrink-0">
                                            Sửa
                                        </button>
                                    </div>
                                )}
                                <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">{profile?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                                <Calendar size={18} className="text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Ngày tham gia</p>
                                    <p className="font-bold text-slate-700 text-sm mt-0.5">
                                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                                <Library size={18} className="text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Sách trong tủ</p>
                                    <p className="font-bold text-slate-700 text-sm mt-0.5">
                                        {profile?.purchasedBooks?.length ?? 0} cuốn
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ĐỔI MẬT KHẨU */}
                <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-8">
                    <h2 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
                        <Lock size={20} className="text-indigo-500" /> Đổi mật khẩu
                    </h2>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                required
                                value={oldPassword}
                                onChange={e => setOldPassword(e.target.value)}
                                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                                placeholder="Nhập mật khẩu hiện tại"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">Mật khẩu mới</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                                placeholder="Tối thiểu 6 ký tự"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                required
                                value={confirmNew}
                                onChange={e => setConfirmNew(e.target.value)}
                                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                                placeholder="Nhập lại mật khẩu mới"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className={`w-full py-3.5 rounded-xl font-bold text-white transition-all active:scale-[0.98] ${saving ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}
                        >
                            {saving ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}

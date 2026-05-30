'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { BookOpen, ArrowLeft, User, Lock, Library, Calendar, CheckCircle2, AlertCircle, Pencil, X } from 'lucide-react';

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
        } catch { showToast('error', 'Có lỗi xảy ra'); }
        finally { setSavingName(false); }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNew) { showToast('error', 'Mật khẩu xác nhận không khớp!'); return; }
        if (newPassword.length < 6) { showToast('error', 'Mật khẩu mới phải có ít nhất 6 ký tự!'); return; }
        setSaving(true);
        try {
            await api.patch('/user/profile/password', { oldPassword, newPassword }, { headers: { Authorization: `Bearer ${getToken()}` } });
            showToast('success', 'Đổi mật khẩu thành công!');
            setOldPassword(''); setNewPassword(''); setConfirmNew('');
        } catch (err: any) {
            showToast('error', err.response?.data?.message || 'Có lỗi xảy ra');
        } finally { setSaving(false); }
    };

    if (loading) return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const initial = (profile?.displayName || profile?.email || 'U').charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-stone-50 font-sans">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg font-semibold text-sm animate-in slide-in-from-top-4 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <header className="bg-[#1a2e4a] text-white px-6 h-14 flex items-center gap-4 sticky top-0 z-40 shadow">
                <button onClick={() => router.push('/home')} className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-slate-400 hover:text-white">
                    <ArrowLeft size={18}/>
                </button>
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
                        <BookOpen size={14} className="text-white"/>
                    </div>
                    <span className="font-black text-sm">E-Library</span>
                </div>
                <span className="text-slate-400 text-sm ml-2">/ Hồ sơ cá nhân</span>
            </header>

            <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">
                {/* Profile card */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    {/* Banner */}
                    <div className="h-24 bg-gradient-to-r from-[#1a2e4a] to-[#2a4a6a] relative">
                        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)'}}/>
                    </div>

                    <div className="px-6 pb-6">
                        {/* Avatar */}
                        <div className="flex items-end gap-4 -mt-8 mb-5">
                            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg border-4 border-white">
                                {initial}
                            </div>
                            <div className="mb-1">
                                {editingName ? (
                                    <div className="flex items-center gap-2">
                                        <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} autoFocus
                                            className="px-3 py-1.5 border border-amber-300 rounded-lg text-sm font-bold text-stone-800 outline-none focus:ring-2 focus:ring-amber-200 bg-white"
                                            placeholder="Tên hiển thị..." />
                                        <button onClick={handleSaveName} disabled={savingName}
                                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all">
                                            {savingName ? '...' : 'Lưu'}
                                        </button>
                                        <button onClick={() => { setEditingName(false); setDisplayName(profile?.displayName || ''); }}
                                            className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg">
                                            <X size={14}/>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-black text-stone-800 text-lg">
                                            {profile?.displayName || <span className="text-stone-400 font-medium italic text-base">Chưa có tên</span>}
                                        </h2>
                                        <button onClick={() => setEditingName(true)} className="text-stone-300 hover:text-amber-500 transition-colors">
                                            <Pencil size={14}/>
                                        </button>
                                    </div>
                                )}
                                <p className="text-stone-400 text-sm">{profile?.email}</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Library size={16} className="text-amber-600"/>
                                </div>
                                <div>
                                    <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide">Sách trong tủ</p>
                                    <p className="font-black text-stone-800 text-lg leading-none mt-0.5">{profile?.purchasedBooks?.length ?? 0}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Calendar size={16} className="text-blue-600"/>
                                </div>
                                <div>
                                    <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide">Tham gia</p>
                                    <p className="font-bold text-stone-800 text-sm leading-none mt-0.5">
                                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Đổi mật khẩu */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                    <h3 className="font-black text-stone-800 mb-5 flex items-center gap-2">
                        <Lock size={16} className="text-amber-500"/> Đổi mật khẩu
                    </h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        {[
                            { label: 'Mật khẩu hiện tại', value: oldPassword, setter: setOldPassword, placeholder: 'Nhập mật khẩu hiện tại' },
                            { label: 'Mật khẩu mới', value: newPassword, setter: setNewPassword, placeholder: 'Tối thiểu 6 ký tự' },
                            { label: 'Xác nhận mật khẩu mới', value: confirmNew, setter: setConfirmNew, placeholder: 'Nhập lại mật khẩu mới' },
                        ].map(({ label, value, setter, placeholder }) => (
                            <div key={label}>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">{label}</label>
                                <input type="password" required value={value} onChange={e => setter(e.target.value)} placeholder={placeholder}
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-4 focus:ring-amber-100 focus:border-amber-400 outline-none transition-all text-stone-700 text-sm" />
                            </div>
                        ))}
                        <button type="submit" disabled={saving}
                            className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-[0.98] ${saving ? 'bg-amber-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-100'}`}>
                            {saving ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

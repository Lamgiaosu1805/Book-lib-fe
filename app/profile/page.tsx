'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Library, Calendar, CheckCircle2, AlertCircle, Pencil, X, Lock } from 'lucide-react';
import { PASSWORD_RULE, validatePassword } from '@/lib/passwordPolicy';

const Cross = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor">
        <rect x="13" y="2" width="6" height="28" rx="2"/>
        <rect x="4" y="10" width="24" height="6" rx="2"/>
    </svg>
);

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
        const passwordError = validatePassword(newPassword);
        if (passwordError) { showToast('error', passwordError); return; }
        setSaving(true);
        try {
            await api.patch('/user/profile/password', { oldPassword, newPassword }, { headers: { Authorization: `Bearer ${getToken()}` } });
            showToast('success', 'Đổi mật khẩu thành công!');
            setOldPassword(''); setNewPassword(''); setConfirmNew('');
        } catch (err: any) {
            showToast('error', err.response?.data?.message || 'Có lỗi xảy ra');
        } finally { setSaving(false); }
    };

    const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = '#C9A227';
        e.target.style.boxShadow = '0 0 0 3px rgba(201,162,39,0.12)';
    };
    const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = '#E5D5B5';
        e.target.style.boxShadow = 'none';
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9F5EE' }}>
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid #E5D5B5', borderTopColor: '#C9A227' }}/>
        </div>
    );

    const initial = (profile?.displayName || profile?.email || 'U').charAt(0).toUpperCase();

    return (
        <div className="min-h-screen font-sans" style={{ background: '#F9F5EE' }}>
            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg font-semibold text-sm animate-in slide-in-from-top-4 text-white`}
                     style={{ background: toast.type === 'success' ? '#3B6E3B' : '#7B1A1A' }}>
                    {toast.type === 'success' ? <CheckCircle2 size={15}/> : <AlertCircle size={15}/>}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-40 px-6 h-14 flex items-center gap-3"
                    style={{ background: '#250A13', borderBottom: '1px solid rgba(201,162,39,0.2)' }}>
                <button onClick={() => router.push('/home')} className="p-1.5 rounded-lg transition-all" style={{ color: '#9a6070' }}>
                    <ArrowLeft size={17}/>
                </button>
                <div className="w-px h-5" style={{ background: 'rgba(201,162,39,0.2)' }}/>
                <div className="flex items-center gap-2">
                    <span style={{ color: '#C9A227' }}><Cross size={12}/></span>
                    <span className="font-black text-white text-sm">Thư Viện Công Giáo</span>
                </div>
                <span className="text-xs" style={{ color: '#7a4a58' }}>/ Hồ sơ cá nhân</span>
            </header>

            <div className="max-w-xl mx-auto px-6 py-8 space-y-5">
                {/* Profile card */}
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E5D5B5', boxShadow: '0 4px 20px rgba(59,14,30,0.08)' }}>
                    {/* Banner */}
                    <div className="h-24 relative flex items-center justify-center overflow-hidden"
                         style={{ background: '#3B0E1E' }}>
                        <div className="absolute inset-0 opacity-10"
                             style={{ backgroundImage: 'repeating-linear-gradient(0deg, #C9A227 0px, #C9A227 1px, transparent 1px, transparent 30px), repeating-linear-gradient(90deg, #C9A227 0px, #C9A227 1px, transparent 1px, transparent 30px)' }}/>
                        <div className="relative z-10 flex items-center gap-3" style={{ color: '#C9A227', opacity: 0.4 }}>
                            <span className="text-lg">✦</span><Cross size={20}/><span className="text-lg">✦</span>
                        </div>
                        {/* Bottom divider */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5"
                             style={{ background: 'linear-gradient(to right, transparent, #C9A227, transparent)' }}/>
                    </div>

                    <div className="px-6 pb-6" style={{ background: '#FFFDF8' }}>
                        {/* Avatar + name */}
                        <div className="flex items-end gap-4 -mt-7 mb-5">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-xl text-white shrink-0"
                                 style={{ background: '#3B0E1E', border: '3px solid #C9A227', boxShadow: '0 4px 12px rgba(59,14,30,0.3)' }}>
                                {initial}
                            </div>
                            <div className="mb-1 flex-1 min-w-0">
                                {editingName ? (
                                    <div className="flex items-center gap-2">
                                        <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                                            autoFocus placeholder="Tên hiển thị..."
                                            className="flex-1 px-3 py-1.5 rounded-lg text-sm font-bold outline-none transition-all"
                                            style={{ border: '1.5px solid #E5D5B5', background: '#F9F5EE', color: '#3B0E1E' }}
                                            onFocus={inputFocus} onBlur={inputBlur}/>
                                        <button onClick={handleSaveName} disabled={savingName}
                                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                                            style={{ background: '#3B0E1E' }}>
                                            {savingName ? '...' : 'Lưu'}
                                        </button>
                                        <button onClick={() => { setEditingName(false); setDisplayName(profile?.displayName || ''); }}
                                            className="p-1" style={{ color: '#b08080' }}>
                                            <X size={14}/>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-black text-lg truncate" style={{ color: '#3B0E1E' }}>
                                            {profile?.displayName ||
                                                <span className="font-medium italic text-base" style={{ color: '#b08080' }}>Chưa có tên</span>}
                                        </h2>
                                        <button onClick={() => setEditingName(true)} style={{ color: '#C9A227' }}>
                                            <Pencil size={13}/>
                                        </button>
                                    </div>
                                )}
                                <p className="text-xs truncate" style={{ color: '#9a7070' }}>{profile?.email}</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: <Library size={15}/>, label: 'Sách trong tủ', value: `${profile?.purchasedBooks?.length ?? 0} cuốn` },
                                { icon: <Calendar size={15}/>, label: 'Ngày tham gia', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'N/A' },
                            ].map(({ icon, label, value }) => (
                                <div key={label} className="flex items-center gap-3 p-3 rounded-xl"
                                     style={{ background: '#F9F5EE', border: '1px solid #E5D5B5' }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                         style={{ background: 'rgba(201,162,39,0.15)', color: '#C9A227' }}>
                                        {icon}
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: '#b08080' }}>{label}</p>
                                        <p className="font-black text-sm" style={{ color: '#3B0E1E' }}>{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Đổi mật khẩu */}
                <div className="rounded-2xl" style={{ background: '#FFFDF8', border: '1px solid #E5D5B5', boxShadow: '0 4px 20px rgba(59,14,30,0.05)' }}>
                    <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid #E5D5B5' }}>
                        <h3 className="font-black flex items-center gap-2 text-sm" style={{ color: '#3B0E1E' }}>
                            <Lock size={14} style={{ color: '#C9A227' }}/> Đổi mật khẩu
                        </h3>
                        <p className="text-[11px] mt-2 leading-relaxed" style={{ color: '#9a7070' }}>{PASSWORD_RULE}</p>
                    </div>
                    <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                        {[
                            { label: 'Mật khẩu hiện tại', value: oldPassword, setter: setOldPassword, placeholder: 'Nhập mật khẩu hiện tại' },
                            { label: 'Mật khẩu mới', value: newPassword, setter: setNewPassword, placeholder: 'Tối thiểu 6 ký tự' },
                            { label: 'Xác nhận mật khẩu mới', value: confirmNew, setter: setConfirmNew, placeholder: 'Nhập lại mật khẩu mới' },
                        ].map(({ label, value, setter, placeholder }) => (
                            <div key={label}>
                                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#7a3a46' }}>{label}</label>
                                <input type="password" required value={value} onChange={e => setter(e.target.value)}
                                    placeholder={placeholder}
                                    className="w-full px-4 py-3 rounded-xl outline-none transition-all text-sm"
                                    style={{ border: '1.5px solid #E5D5B5', background: '#F9F5EE', color: '#3B0E1E' }}
                                    onFocus={inputFocus} onBlur={inputBlur}/>
                            </div>
                        ))}
                        <button type="submit" disabled={saving}
                            className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
                            style={{ background: saving ? '#9a4a5a' : '#3B0E1E', color: '#C9A227', boxShadow: '0 4px 15px rgba(59,14,30,0.25)' }}>
                            {saving ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
                        </button>
                    </form>
                </div>

                {/* Footer ornament */}
                <div className="text-center py-2">
                    <div className="flex items-center justify-center gap-3" style={{ color: '#C9A227' }}>
                        <span className="text-xs opacity-50">✦</span>
                        <Cross size={12}/>
                        <span className="text-xs opacity-50">✦</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

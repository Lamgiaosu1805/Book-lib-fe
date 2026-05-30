'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Mail, ShieldCheck, UserCircle } from 'lucide-react';
import { ADMIN_PASSWORD_RULE, validateAdminPassword } from '../../utils/passwordPolicy';

type ApiError = {
    response?: {
        data?: {
            message?: string;
        };
    };
};

type AdminProfile = {
    email?: string;
    username?: string;
    displayName?: string;
    saintName?: string;
    isSuperAdmin?: boolean;
};

const formatUsername = (username?: string) => {
    const clean = username?.replace(/^@+/, '').trim();
    return clean || '';
};

export default function AdminPasswordSettings() {
    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

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

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/admin/me', {
                    headers: { Authorization: `Bearer ${getToken()}` },
                });
                setProfile(res.data);
            } catch {
                setProfile(null);
            }
        };

        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showToast('error', 'Mật khẩu xác nhận không khớp');
            return;
        }

        const passwordError = validateAdminPassword(newPassword);
        if (passwordError) {
            showToast('error', passwordError);
            return;
        }

        setLoading(true);
        try {
            const res = await api.patch('/admin/change-password',
                { oldPassword, newPassword },
                { headers: { Authorization: `Bearer ${getToken()}` } },
            );
            document.cookie = `token=${res.data.data.accessToken}; path=/; max-age=604800; samesite=lax`;
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            showToast('success', 'Đã đổi mật khẩu');
        } catch (err: unknown) {
            showToast('error', (err as ApiError).response?.data?.message || 'Không thể đổi mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 42px 10px 14px', borderRadius: 10, outline: 'none',
        border: '1.5px solid #E5D5B5', background: '#F9F5EE', color: '#3B0E1E', fontSize: 13,
    };

    const fullName = [profile?.saintName, profile?.displayName].filter(Boolean).join(' ');
    const displayName = fullName || profile?.username || profile?.email || 'Quản trị viên';
    const usernameLabel = formatUsername(profile?.username);
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <div className="max-w-3xl space-y-6">
            {toast && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg font-semibold text-sm text-white"
                     style={{ background: toast.type === 'success' ? '#3B6E3B' : '#7B1A1A' }}>
                    {toast.type === 'success' ? <CheckCircle2 size={15}/> : <AlertCircle size={15}/>}
                    {toast.msg}
                </div>
            )}

            <div className="rounded-2xl p-6" style={{ background: '#FFFDF8', border: '1px solid #E5D5B5' }}>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-lg shrink-0"
                         style={{ background: '#3B0E1E', color: '#C9A227', border: '2px solid #E5D5B5' }}>
                        {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-black text-base truncate flex items-center gap-2" style={{ color: '#3B0E1E' }}>
                            <UserCircle size={17}/> {displayName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {usernameLabel && (
                                <span className="text-[11px] font-bold px-2 py-1 rounded-lg"
                                      style={{ background: '#F9F5EE', color: '#C9A227', border: '1px solid #E5D5B5' }}>
                                    {usernameLabel}
                                </span>
                            )}
                            {profile?.email && (
                                <span className="text-[11px] font-semibold flex items-center gap-1"
                                      style={{ color: '#9a7070' }}>
                                    <Mail size={11}/> {profile.email}
                                </span>
                            )}
                            {profile?.isSuperAdmin && (
                                <span className="text-[9px] font-black px-2 py-1 rounded-lg flex items-center gap-1"
                                      style={{ background: '#3B0E1E', color: '#C9A227' }}>
                                    <ShieldCheck size={10}/> SUPER ADMIN
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl p-6" style={{ background: '#FFFDF8', border: '1px solid #E5D5B5' }}>
                <h3 className="font-black text-base mb-1 flex items-center gap-2" style={{ color: '#3B0E1E' }}>
                    <KeyRound size={17}/> Đổi mật khẩu
                </h3>
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-6 h-0.5" style={{ background: '#C9A227' }}/>
                    <p className="text-xs" style={{ color: '#9a7070' }}>Cập nhật mật khẩu tài khoản quản trị của bạn</p>
                </div>
                <p className="text-[11px] mb-4 leading-relaxed" style={{ color: '#9a7070' }}>{ADMIN_PASSWORD_RULE}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                        { label: 'Mật khẩu hiện tại', value: oldPassword, setter: setOldPassword },
                        { label: 'Mật khẩu mới', value: newPassword, setter: setNewPassword },
                        { label: 'Xác nhận mật khẩu mới', value: confirmPassword, setter: setConfirmPassword },
                    ].map(({ label, value, setter }) => (
                        <div key={label}>
                            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                                   style={{ color: '#7a3a46' }}>{label}</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} required value={value}
                                    onChange={e => setter(e.target.value)}
                                    style={inputStyle}/>
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                    style={{ color: '#9a7070' }}>
                                    {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
                                </button>
                            </div>
                        </div>
                    ))}

                    <button type="submit" disabled={loading}
                        className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                        style={{ background: loading ? '#9a4a5a' : '#3B0E1E', color: '#C9A227', boxShadow: '0 4px 15px rgba(59,14,30,0.2)' }}>
                        {loading ? <Loader2 size={16} className="animate-spin"/> : <KeyRound size={16}/>}
                        {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';

type ApiError = {
    response?: {
        data?: {
            message?: string;
        };
    };
};

export default function AdminPasswordSettings() {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showToast('error', 'Mật khẩu xác nhận không khớp');
            return;
        }

        if (newPassword.length < 6) {
            showToast('error', 'Mật khẩu mới phải có ít nhất 6 ký tự');
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

    return (
        <div className="max-w-xl">
            {toast && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg font-semibold text-sm text-white"
                     style={{ background: toast.type === 'success' ? '#3B6E3B' : '#7B1A1A' }}>
                    {toast.type === 'success' ? <CheckCircle2 size={15}/> : <AlertCircle size={15}/>}
                    {toast.msg}
                </div>
            )}

            <div className="rounded-2xl p-6" style={{ background: '#FFFDF8', border: '1px solid #E5D5B5' }}>
                <h3 className="font-black text-base mb-1 flex items-center gap-2" style={{ color: '#3B0E1E' }}>
                    <KeyRound size={17}/> Đổi mật khẩu
                </h3>
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-6 h-0.5" style={{ background: '#C9A227' }}/>
                    <p className="text-xs" style={{ color: '#9a7070' }}>Cập nhật mật khẩu tài khoản quản trị của bạn</p>
                </div>

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
